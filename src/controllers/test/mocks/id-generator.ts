export class IdGenerator {
  private nextId = 0;

  getNextId() {
    return this.nextId++;
  }
}
