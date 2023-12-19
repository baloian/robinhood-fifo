export default class Queue<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): void {
    this.items.shift();
  }

  front(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  updateFront(data: T): void {
    this.items[0] = JSON.parse(JSON.stringify(data));
  }
}

