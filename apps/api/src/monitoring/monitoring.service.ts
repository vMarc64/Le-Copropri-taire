import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

export interface SystemMetrics {
  cpu: {
    usage: number; // percentage
    cores: number;
  };
  memory: {
    total: number; // MB
    used: number; // MB
    free: number; // MB
    usage: number; // percentage
  };
  disk: {
    total: number; // GB
    used: number; // GB
    free: number; // GB
    usage: number; // percentage
    mountPoint: string;
  };
  uptime: number; // seconds
  loadAverage: number[];
}

@Injectable()
export class MonitoringService {
  async getSystemMetrics(): Promise<SystemMetrics> {
    const [cpuUsage, memoryInfo, diskInfo] = await Promise.all([
      this.getCpuUsage(),
      this.getMemoryInfo(),
      this.getDiskInfo(),
    ]);

    return {
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length,
      },
      memory: memoryInfo,
      disk: diskInfo,
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
    };
  }

  private async getCpuUsage(): Promise<number> {
    try {
      // Use /proc/stat for accurate CPU usage on Linux
      const { stdout } = await execAsync(
        "cat /proc/stat | head -1 | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'"
      );
      const usage = parseFloat(stdout.trim());
      return isNaN(usage) ? 0 : Math.round(usage * 10) / 10;
    } catch {
      // Fallback: calculate from os.cpus()
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach((cpu) => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        totalIdle += cpu.times.idle;
      });
      
      const usage = 100 - (totalIdle / totalTick) * 100;
      return Math.round(usage * 10) / 10;
    }
  }

  private async getMemoryInfo(): Promise<SystemMetrics['memory']> {
    try {
      // Use free command for accurate memory on Linux
      const { stdout } = await execAsync("free -m | grep Mem");
      const parts = stdout.trim().split(/\s+/);
      // Mem: total used free shared buff/cache available
      const total = parseInt(parts[1], 10);
      const used = parseInt(parts[2], 10);
      const free = parseInt(parts[3], 10);
      
      return {
        total,
        used,
        free,
        usage: Math.round((used / total) * 100 * 10) / 10,
      };
    } catch {
      // Fallback: use os module
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      return {
        total: Math.round(totalMem / 1024 / 1024),
        used: Math.round(usedMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024),
        usage: Math.round((usedMem / totalMem) * 100 * 10) / 10,
      };
    }
  }

  private async getDiskInfo(): Promise<SystemMetrics['disk']> {
    try {
      const { stdout } = await execAsync("df -BG / | tail -1");
      const parts = stdout.trim().split(/\s+/);
      // Filesystem Size Used Avail Use% Mounted
      const total = parseInt(parts[1].replace('G', ''), 10);
      const used = parseInt(parts[2].replace('G', ''), 10);
      const free = parseInt(parts[3].replace('G', ''), 10);
      const usage = parseInt(parts[4].replace('%', ''), 10);
      
      return {
        total,
        used,
        free,
        usage,
        mountPoint: parts[5],
      };
    } catch {
      return {
        total: 0,
        used: 0,
        free: 0,
        usage: 0,
        mountPoint: '/',
      };
    }
  }
}
