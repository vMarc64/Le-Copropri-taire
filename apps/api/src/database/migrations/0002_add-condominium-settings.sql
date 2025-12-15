ALTER TABLE "condominiums" ADD COLUMN "call_frequency" varchar(20) DEFAULT 'monthly' NOT NULL;--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "cb_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "bank_iban" varchar(34);--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "bank_bic" varchar(11);--> statement-breakpoint
ALTER TABLE "condominiums" ADD COLUMN "bank_name" varchar(255);