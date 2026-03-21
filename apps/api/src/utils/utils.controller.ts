import { Controller, Get } from '@nestjs/common';
import { db } from '../db/connection';
import { sql } from 'drizzle-orm';

@Controller('utils')
export class UtilsController {
  @Get('uuid')
  async generateUuid() {
    const result = await db.execute(sql`SELECT gen_random_uuid() as uuid`);
    return { uuid: result.rows[0].uuid };
  }
}
