import { UpdateWriteOpResult } from 'mongoose';

export class UpdatedColumnResult {
  constructor(private updateResult: UpdateWriteOpResult) {}

  wasSuccessful() {
    return this.updateResult.modifiedCount === 1;
  }
}
