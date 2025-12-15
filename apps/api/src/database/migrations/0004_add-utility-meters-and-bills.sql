CREATE TABLE "lot_meters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"lot_id" uuid NOT NULL,
	"meter_type" varchar(30) NOT NULL,
	"meter_number" varchar(50),
	"is_dual_tariff" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_reading_date" date,
	"last_reading_value" numeric(12, 3),
	"last_reading_value_off_peak" numeric(12, 3),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meter_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"utility_bill_id" uuid NOT NULL,
	"lot_meter_id" uuid NOT NULL,
	"previous_index" numeric(12, 3) NOT NULL,
	"current_index" numeric(12, 3) NOT NULL,
	"previous_index_off_peak" numeric(12, 3),
	"current_index_off_peak" numeric(12, 3),
	"consumption" numeric(12, 3) NOT NULL,
	"consumption_off_peak" numeric(12, 3),
	"allocated_amount" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utility_bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"condominium_id" uuid NOT NULL,
	"utility_type" varchar(30) NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"global_index_start" numeric(12, 3),
	"global_index_end" numeric(12, 3),
	"global_index_off_peak_start" numeric(12, 3),
	"global_index_off_peak_end" numeric(12, 3),
	"total_consumption" numeric(12, 3),
	"total_consumption_off_peak" numeric(12, 3),
	"unit" varchar(10) DEFAULT 'm3' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"invoice_number" varchar(50),
	"invoice_date" date,
	"supplier_name" varchar(255),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lot_meters" ADD CONSTRAINT "lot_meters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lot_meters" ADD CONSTRAINT "lot_meters_lot_id_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."lots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_utility_bill_id_utility_bills_id_fk" FOREIGN KEY ("utility_bill_id") REFERENCES "public"."utility_bills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_lot_meter_id_lot_meters_id_fk" FOREIGN KEY ("lot_meter_id") REFERENCES "public"."lot_meters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_bills" ADD CONSTRAINT "utility_bills_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_bills" ADD CONSTRAINT "utility_bills_condominium_id_condominiums_id_fk" FOREIGN KEY ("condominium_id") REFERENCES "public"."condominiums"("id") ON DELETE cascade ON UPDATE no action;