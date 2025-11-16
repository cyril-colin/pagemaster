import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameSession, Participant } from '@pagemaster/common/pagemaster.types';
import { CURRENT_PARTICIPANT_CACHE_KEY, CURRENT_PARTICIPANT_TTL, LocalStorageService } from './local-storage.service';
import { PageMasterRoutes } from './pagemaster.router';


@Injectable({
  providedIn: 'root',
})
export class CurrentParticipantState {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private currentParticipantSignal = signal<Participant['id'] | null>(null);
  public currentParticipant = this.currentParticipantSignal.asReadonly();

  init(gameSession: GameSession){
    const cachedParticipant = this.localStorageService.getItem<Participant['id']>(CURRENT_PARTICIPANT_CACHE_KEY);
    if (!cachedParticipant) {
      return;
    }

    const existingParticipant = gameSession.participants.find(p => p.id === cachedParticipant);
    if (!existingParticipant) {
      this.currentParticipantSignal.set(null);
      this.localStorageService.removeItem(CURRENT_PARTICIPANT_CACHE_KEY);
      console.warn('Cached participant not found in game instance, clearing cache');
      return;
    }

    this.localStorageService.setItem<Participant['id']>(CURRENT_PARTICIPANT_CACHE_KEY, existingParticipant.id, CURRENT_PARTICIPANT_TTL);
    this.currentParticipantSignal.set(existingParticipant.id);
  }

  setParticipant(participant: Participant['id']): void {
    this.currentParticipantSignal.set(participant);
    this.localStorageService.setItem<Participant['id']>(CURRENT_PARTICIPANT_CACHE_KEY, participant, CURRENT_PARTICIPANT_TTL);
  }

  clearParticipant(): void {
    this.currentParticipantSignal.set(null);
    this.localStorageService.removeItem(CURRENT_PARTICIPANT_CACHE_KEY);
    void this.router.navigate(['', ...PageMasterRoutes().Home.path.split('/')]);
  }
}