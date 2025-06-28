import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Avatar } from "../../../core/models/user.model";

@Component({
  selector: "app-avatar-selector",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6">
      <!-- Custom Avatar Upload -->
      <div class="mb-4">
        <div class="flex items-center space-x-3">
          <input
            type="file"
            #fileInput
            (change)="onFileSelected($event)"
            accept="image/*"
            class="hidden"
            id="avatar-upload"
          />
          <label
            for="avatar-upload"
            class="cursor-pointer bg-spotify-green text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            Upload Profile Image
          </label>
          <span *ngIf="customAvatarUrl" class="text-sm theme-muted">
            ✓ Selected
          </span>
        </div>
      </div>

      <!-- Custom Avatar Preview -->
      <div *ngIf="customAvatarUrl" class="mb-4 text-center">
        <div
          (click)="selectCustomAvatar()"
          [class.selected]="selectedAvatar === 'custom'"
          class="avatar-option w-16 h-16 mx-auto"
        >
          <img
            [src]="customAvatarUrl"
            alt="Custom Avatar"
            class="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  `,
})
export class AvatarSelectorComponent {
  @Input() selectedAvatar: string = "";
  @Output() avatarSelected = new EventEmitter<string>();
  @Output() customAvatarSelected = new EventEmitter<string>();

  customAvatarUrl: string | null = null;

  selectCustomAvatar(): void {
    this.selectedAvatar = "custom";
    this.avatarSelected.emit("custom");
    if (this.customAvatarUrl) {
      this.customAvatarSelected.emit(this.customAvatarUrl);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.customAvatarUrl = e.target.result;
        this.selectCustomAvatar();
      };
      reader.readAsDataURL(file);
    }
  }

  getAvatarUrl(avatarId: string): string {
    if (avatarId === "custom" && this.customAvatarUrl) {
      return this.customAvatarUrl;
    }
    return this.customAvatarUrl || "";
  }
}
