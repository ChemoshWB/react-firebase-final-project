import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

function App() {
  // --- STATE ---
  const [note, setNote] = useState("");
  const [notesList, setNotesList] = useState([]);

  // --- FORCE CSS ONTO THE HTML BODY DIRECTLY VIA REACT ---
  useEffect(() => {
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100%";

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.body.style.backgroundColor = "#F8F9FA"; // Clean off-white background
  }, []);

  // --- LOGIC: SAVE NOTE TO FIRESTORE ---
  const saveNote = async () => {
    if (note.trim() === "") return;
    try {
      await addDoc(collection(db, "notes"), { 
        text: note, 
        createdAt: new Date() 
      });
      setNote(""); // Clear input after saving
    } catch (error) {
      console.error("Error adding note: ", error);
    }
  };

  // --- LOGIC: LIVE LISTEN TO NOTES COLLECTION ---
  useEffect(() => {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesArray = [];
      querySnapshot.forEach((doc) => {
        notesArray.push({ ...doc.data(), id: doc.id });
      });
      setNotesList(notesArray);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div style={styles.container}>
      {/* 1. STYLED GRADIENT HEADER */}
      <div style={styles.headerArea}>
        <h1 style={styles.mainTitle}>Cloud Notes App</h1>
        <p style={styles.subTitle}>Frontend + Backend</p>
      </div>
      
      {/* TWO-COLUMN GRID */}
      <div style={styles.grid}>
        
        {/* LEFT COLUMN: QUICK NOTES FORM */}
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Quick Notes</h2>
            <div style={styles.inlineForm}>
              <input
                type="text"
                placeholder="Log a quick note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={styles.input}
              />
              <button onClick={saveNote} style={styles.buttonInline}>Push</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: THE NOTES DATABASE TABLE */}
        <div style={styles.rightColumn}>
          <div style={styles.tableCard}>
            <div style={styles.tableHeaderArea}>
              <h2 style={styles.cardTitleNoMargin}>Notes Record</h2>
              <div style={styles.pulseBadge}>
                <span style={styles.pulseDot}></span> Live
              </div>
            </div>
            
            {notesList.length === 0 ? (
              <div style={styles.emptyWrapper}>
                <p style={styles.emptyText}>Awaiting database entries...</p>
              </div>
            ) : (
              <div style={styles.scrollArea}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Note Content</th>
                      <th style={styles.th}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notesList.map((noteItem) => (
                      <tr key={noteItem.id} style={styles.tr}>
                        <td style={styles.td}>{noteItem.text}</td>
                        <td style={styles.tdDate}>
                          {noteItem.createdAt?.toDate 
                            ? noteItem.createdAt.toDate().toLocaleString() 
                            : "Just now"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


const styles = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    backgroundColor: "#F8F9FA",
    height: "100vh",
    boxSizing: "border-box",
    padding: "20px 30px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    color: "#212529"
  },
  headerArea: {
    textAlign: "center",
    marginBottom: "20px"
  },
  mainTitle: {
    fontSize: "1.8rem",
    fontWeight: "800",
    margin: "0 0 4px 0",
    letterSpacing: "0.5px",
    
    background: "linear-gradient(45deg, #4FACFE 0%, #00F2FE 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subTitle: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#6C757D",
    fontWeight: "500",
    letterSpacing: "0.5px"
  },
  grid: {
    display: "flex",
    gap: "25px",
    flex: "1",
    minHeight: "0"
  },
  leftColumn: {
    flex: "4",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  rightColumn: {
    flex: "6",
    display: "flex",
  },
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E9ECEF",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.04)",
  },
  tableCard: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E9ECEF",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.04)",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: "0"
  },
  tableHeaderArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #E9ECEF",
    paddingBottom: "12px",
    marginBottom: "12px"
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 15px 0",
    color: "#212529",
    borderBottom: "1px solid #E9ECEF",
    paddingBottom: "10px",
  },
  cardTitleNoMargin: {
    fontSize: "1rem",
    fontWeight: "600",
    margin: 0,
    color: "#212529",
  },
  inlineForm: {
    display: "flex",
    gap: "10px",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #CED4DA",
    backgroundColor: "#FFFFFF",
    color: "#212529",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
    flex: 1
  },
  buttonInline: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(79, 172, 254, 0.3)",
    transition: "transform 0.1s ease",
  },
  scrollArea: {
    overflowY: "auto",
    flex: "1",
    minHeight: "0"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "10px",
    color: "#6C757D",
    fontWeight: "700",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF", 
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #E9ECEF",
    fontSize: "0.9rem",
    color: "#495057",
  },
  tdDate: {
    padding: "12px 10px",
    borderBottom: "1px solid #E9ECEF",
    fontSize: "0.8rem",
    color: "#ADB5BD",
  },
  tr: {
    borderBottom: "1px solid #E9ECEF",
  },
  emptyWrapper: {
    display: "flex",
    flex: "1",
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    color: "#ADB5BD",
    fontSize: "0.9rem",
    fontStyle: "italic"
  },
  pulseBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.75rem",
    color: "#2ECC71",
    fontWeight: "700"
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#2ECC71",
    borderRadius: "50%",
    display: "inline-block"
  }
};

export default App;