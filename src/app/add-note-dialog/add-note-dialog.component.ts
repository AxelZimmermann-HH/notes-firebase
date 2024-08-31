import { Component, Output, EventEmitter } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { NoteListService } from '../firebase-services/note-list.service'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-note-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-note-dialog.component.html',
  styleUrl: './add-note-dialog.component.scss'
})
export class AddNoteDialogComponent {
  //Hier wird addDialogClosed definiert und mit einem EventEmitter versehen.
  @Output() addDialogClosed: EventEmitter<boolean> = new EventEmitter();
  title = "";
  description = "";

  //Gängige Methode: injection des NoteListService. Durch private noteService ist noteListService 
  //in der Komponente nur in noteService verfügbar.
  constructor(private noteService: NoteListService){}

  closeDialog() {
    this.title = "";
    this.description = "";
    //Hier wird das Event ausgelöst und addDialogClosed auf false gesetzt. Der Rest passiert
    // im app.component.html
    this.addDialogClosed.emit(false);
  }

  addNote(){
    let note:Note = {
      type: "note",
      title:this.title,
      content:this.description,
      marked: false,
    }
    this.noteService.addNote(note, "notes")
    this.closeDialog();
  }
}
