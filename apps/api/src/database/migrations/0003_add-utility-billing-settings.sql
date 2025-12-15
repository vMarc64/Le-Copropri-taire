ALTER TABLE "condominiums" ADD COLUMN "cold_water_billing" varchar(20) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "hot_water_billing" varchar(20) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "heating_billing" varchar(20) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "gas_billing" varchar(20) DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "electricity_common_billing" varchar(20) DEFAULT 'none' NOT NULL;