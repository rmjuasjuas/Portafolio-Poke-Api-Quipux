import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.html',
  styleUrl: './skills.css'
})
export class Skills {
  programmingSkills = [
    { name: 'HTML', level: 50, levelText: 'Junior' },
    { name: 'JavaScript', level: 30, levelText: 'Junior' },
    { name: 'PHP', level: 40, levelText: 'Junior' },
    { name: 'Java', level: 40, levelText: 'Junior' },
    { name: 'Python', level: 20, levelText: 'Junior' },
    { name: 'TypeScript', level: 20, levelText: 'Junior' },
  ];

  getSkillBarWidth(level: number): string {
    return `${level}%`;
  }
}