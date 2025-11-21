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
    { name: 'HTML', level: 40, levelText: 'Junior' },
    { name: 'JavaScript', level: 25, levelText: 'Junior' },
    { name: 'PHP', level: 35, levelText: 'Junior' },
    { name: 'Java', level: 10, levelText: 'Junior' },
    { name: 'Python', level: 10, levelText: 'Junior' },
    { name: 'TypeScript', level: 15, levelText: 'Junior' },
  ];

  getSkillBarWidth(level: number): string {
    return `${level}%`;
  }
}