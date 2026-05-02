import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  timeLeft = signal(25 * 60);
  isRunning = signal(false);
  mode = signal<'focus' | 'short' | 'long'>('focus');
  theme = signal('ocean');
  taskName = signal('Deep Work Session');
  completedSessions = signal(0);

  private intervalId: any;

  constructor() {
    effect(() => {
      if (this.timeLeft() === 0) {
        this.completeSession();
      }
    });
  }

  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  progress = computed(() => {
    const total = this.mode() === 'focus' ? 25 * 60 : this.mode() === 'short' ? 5 * 60 : 15 * 60;
    return ((total - this.timeLeft()) / total) * 100;
  });

  // ✅ FIXED: Return CSS variables for the theme
  themeStyles = computed(() => {
    const themes: Record<string, { primary: string; orb1: string; orb2: string }> = {
      ocean: { primary: '#0ea5e9', orb1: '#0ea5e9', orb2: '#0284c7' },
      forest: { primary: '#22c55e', orb1: '#22c55e', orb2: '#16a34a' },
      sunset: { primary: '#f97316', orb1: '#f97316', orb2: '#ea580c' },
      lavender: { primary: '#a855f7', orb1: '#a855f7', orb2: '#9333ea' }
    };
    return themes[this.theme()];
  });

  toggleTimer() {
    if (this.isRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer() {
    this.isRunning.set(true);
    this.intervalId = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 0) {
          this.pauseTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private pauseTimer() {
    this.isRunning.set(false);
    clearInterval(this.intervalId);
  }

  resetTimer() {
    this.pauseTimer();
    const times = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
    this.timeLeft.set(times[this.mode()]);
  }

  setMode(newMode: 'focus' | 'short' | 'long') {
    this.mode.set(newMode);
    this.resetTimer();
  }

  completeSession() {
    this.pauseTimer();
    this.completedSessions.update(s => s + 1);
  }

  setTheme(newTheme: string) {
    this.theme.set(newTheme as any);
  }
}
