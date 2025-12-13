import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { StripeMockService } from './stripe-mock.service';
import { CreateCustomerDto, CreateSepaPaymentMethodDto, CreatePaymentIntentDto } from './dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeMockService) {}

  // ============ CUSTOMERS ============

  @Post('customers')
  async createCustomer(@Body() dto: CreateCustomerDto) {
    return this.stripeService.createCustomer(dto);
  }

  @Get('customers')
  async listCustomers() {
    return this.stripeService.listCustomers();
  }

  @Get('customers/:id')
  async getCustomer(@Param('id') id: string) {
    return this.stripeService.getCustomer(id);
  }

  // ============ PAYMENT METHODS (SEPA) ============

  @Post('payment-methods/sepa')
  async createSepaPaymentMethod(@Body() dto: CreateSepaPaymentMethodDto) {
    return this.stripeService.createSepaPaymentMethod(dto);
  }

  @Get('payment-methods/:id')
  async getPaymentMethod(@Param('id') id: string) {
    return this.stripeService.getPaymentMethod(id);
  }

  @Post('payment-methods/:id/attach')
  async attachPaymentMethod(
    @Param('id') id: string,
    @Body('customerId') customerId: string,
  ) {
    return this.stripeService.attachPaymentMethodToCustomer(id, customerId);
  }

  @Get('customers/:customerId/payment-methods')
  async listPaymentMethods(@Param('customerId') customerId: string) {
    return this.stripeService.listPaymentMethods(customerId);
  }

  // ============ MANDATES ============

  @Post('mandates')
  async createMandate(
    @Body('paymentMethodId') paymentMethodId: string,
    @Body('ipAddress') ipAddress?: string,
    @Body('userAgent') userAgent?: string,
  ) {
    return this.stripeService.createMandate(paymentMethodId, ipAddress, userAgent);
  }

  @Get('mandates/:id')
  async getMandate(@Param('id') id: string) {
    return this.stripeService.getMandate(id);
  }

  @Delete('mandates/:id')
  @HttpCode(HttpStatus.OK)
  async revokeMandate(@Param('id') id: string) {
    return this.stripeService.revokeMandate(id);
  }

  // ============ PAYMENT INTENTS ============

  @Post('payment-intents')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(dto);
  }

  @Get('payment-intents/:id')
  async getPaymentIntent(@Param('id') id: string) {
    return this.stripeService.getPaymentIntent(id);
  }

  @Post('payment-intents/:id/confirm')
  async confirmPaymentIntent(@Param('id') id: string) {
    return this.stripeService.confirmPaymentIntent(id);
  }

  @Post('payment-intents/:id/cancel')
  async cancelPaymentIntent(@Param('id') id: string) {
    return this.stripeService.cancelPaymentIntent(id);
  }

  @Get('payment-intents')
  async listPaymentIntents() {
    return this.stripeService.listPaymentIntents();
  }

  // ============ WEBHOOKS ============

  @Post('webhooks/simulate')
  async simulateWebhook(
    @Body('type') type: string,
    @Body('data') data: Record<string, unknown>,
  ) {
    return this.stripeService.simulateWebhookEvent(type, data);
  }
}
