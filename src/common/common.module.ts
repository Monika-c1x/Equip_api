import { Module, Global } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { registerEnums } from './enums';

// Register GraphQL enums
registerEnums();

@Global()
@Module({
  imports: [LoggerModule],
  exports: [LoggerModule],
})
export class CommonModule {}