
export type State<T = unknown> = {
  id: string;
  value: T;
}
export class StateService {
  private state: State[] = [];

  public getState<T>(id: string): State<T> | undefined {
    return this.state.find(s => s.id === id) as State<T> | undefined;
  }
  public setState<T>(id: string, value: T): State<T> {
    const existingState = this.getState(id);
    if (existingState) {
      existingState.value = value;
      return existingState as State<T>;
    }
    const newState: State<T> = { id, value };
    this.state.push(newState);
    return newState;
  }
  public deleteState(id: string): void {
    this.state = this.state.filter(s => s.id !== id);
  }
  public clearState(): void {
    this.state = [];
  }
  public getAllStates(): State[] {
    return this.state;
  }
  public hasState(id: string): boolean {
    return this.state.some(s => s.id === id);
  }
  public getStateValue(id: string): unknown | undefined {
    const state = this.getState(id);
    return state ? state.value : undefined;
  }
  public setStateValue(id: string, value: unknown): State<unknown> {
    const state = this.getState(id);
    if (state) {
      state.value = value;
      return state;
    }
    return this.setState(id, value);
  }
}