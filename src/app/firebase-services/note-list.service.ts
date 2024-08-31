import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { query, orderBy, limit, where, Firestore, collection, collectionData, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// Füge diesen Import oben in deiner Datei hinzu:
import { CollectionReference, DocumentData } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];


  // Variablen, die Funktionen speichern, die vom Firestore-Abo ABMELDEN.
  unsubNotes: () => void;
  unsubTrash: () => void;
  unsubMarkedNotes: () => void;


  firestore: Firestore = inject(Firestore)

  constructor() { 

    // Echtzeit-Listener auf Notizen-Array. onSnapshot sorgt dafür, dass bei jeder Änderung 
    // in der Firestore-Sammlung notes die Änderungen abgerufen und verarbeitet werden.
    // VORTEIL: Bei onSnapshot kommen Elemente zurück, auf die man zugreifen kann, siehe console.
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    
  };


  subNotesList() {
    // limit: es wird nur der erste Eintrag abgegriffen
    // orderBy: ordnet die Einträge nach angegebenen Attribut, Achtung: klein nach Groß.
    // where: filter nach einem bestimmten Attribut-Wert
    // docChanges zeigt hier in der Console nur auf, wenn ein Objekt hinzugefügt, verändert 
    // oder gelöscht wird. Das ist praktisch!
    // Durch Datenpfade kann man auch auf Sublists zugreifen.
    const q = query(this.getNotesRef(), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = []; // Array trashNotes erstmal leeren
      list.forEach(element => { 
        this.normalNotes.push(this.setNoteObject(element.data(), element.id)); // Objekte ins Array pushen
      });
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed note: ", change.doc.data());
        }
      })
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = []; // Array trashNotes erstmal leeren
      list.forEach(element => { 
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id)); // Objekte ins Array pushen
      })
    });
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => { // Abfrage der Daten collection trash
      this.trashNotes = []; // Array trashNotes erstmal leeren
      list.forEach(element => { 
        this.trashNotes.push(this.setNoteObject(element.data(), element.id)); // Objekte ins Array pushen
      })
    });
  };

  

  // Wichtig, falls einige Parameter nicht ausgefüllt sind, werden diese Standard-Werte übergeben.
  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || "",
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false
    }
  };

  async addNote(item: Note, colId: 'notes' | 'trash') {
    let notesRef: CollectionReference<DocumentData>;
  
    // colId soll ja übergeben werden. Daher hier definieren, welche Daten abgegriffen werden.
    if (colId === 'notes') {
      notesRef = this.getNotesRef();
    } else if (colId === 'trash') {
      notesRef = this.getTrashRef();
    } else {
      throw new Error(`Invalid colId: ${colId}`);
    }
  
    // Füge das Dokument zur ausgewählten Collection hinzu
    await addDoc(notesRef, item).catch(
      (err) => {console.error(err);})
      .then((docRef) => {console.log('Document written with ID: ', docRef?.id);});
  };


  async updateNote(note: Note) {
    //if-Abfrage falls note undefined ist. Denn note.id ist optional.
    if(note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => {console.log(err); }
      ).then();
    } 
  }

  async deleteNote(colId: "notes" | "trash", docID:string) {
    await deleteDoc(this.getSingleDocRef(colId, docID)).catch(
      (err) => { console.error(err)}
    )
  }

  getColIdFromNote(note:Note) {
    if(note.type == 'note'){
      return 'notes'
    } else {
      return 'trash'
    }
  }

  getCleanJson(note:Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }

  

  // Sicherstellen, dass unsubscriped wird, wenn die Instanz des Services zerstört wird.
  ngOnDestroy() {
    //Eine "Kündigung" findet bei diesen beiden nur deshalb statt, weil sie unter ngOnDestroy stehen.
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarkedNotes();
  }

  //BAUSTEINE FÜR DIE OBIGEN METHODEN

  // mit collection greifen wir auf die Listen im Firestore zu
  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  // Mit doc greifen wir auf einzelne Listenelemente zu
  getSingleDocRef(colId:string, docID:string) {
    return doc(collection(this.firestore, colId), docID);
  }
}

