import { useEffect, useState } from "react";

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "2rem",
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "1rem",
    margin: "1rem 0",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    border: "1px solid #ddd",
  },
  heading: {
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "400px",
    margin: "1rem 0",
  },
  input: {
    marginBottom: "1rem",
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  logoutButton: {
    ...this?.button,
    backgroundColor: "#f44336",
    marginBottom: "1rem",
    padding: "0.5rem",
    fontSize: "0.9rem",
    border:"none"
  }
};


function App() {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState({
    loggedIn: false,
    token: null,
    id: null,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const logIn=(e)=>{
    e.preventDefault();
    fetch("https://backend-hotel-gwse.onrender.com/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: username,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("hotel-token", data.token);
          localStorage.setItem("hotel-id", data.id);
          setUser({
            loggedIn: true,
            token: data.token,
            id: data.id,
          });
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    
  }

  useEffect(() => {
    const token = localStorage.getItem("hotel-token");
    const id = localStorage.getItem("hotel-id");
    if (token) {
      setUser({
        loggedIn: true,
        token: token,
        id: id,
      });
    }
  } , []);
  useEffect(() => {

    if (!user.loggedIn) return;
    fetch("https://backend-hotel-gwse.onrender.com/api/rooms", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setRooms(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [user]);

 
  const deleteRoom = (id) => {
    fetch(`https://backend-hotel-gwse.onrender.com/api/rooms/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((response) => response.json())
      .then(() => {
        setRooms(rooms.filter((room) => room.id !== id));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }


  return (
    <div style={styles.container}>
      {!user.loggedIn ? (
        <>
          <h1 style={styles.heading}>Welcome to the Hotel Booking App</h1>
          <p>Please log in to continue.</p>
          <form style={styles.form} onSubmit={logIn}>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Username"
            />
            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
            />
            <button style={styles.button} type="submit">Log In</button>
          </form>
        </>
      ) : (
        <>
          <button style={styles.logoutButton} onClick={() => {
            localStorage.removeItem("hotel-token");
            localStorage.removeItem("hotel-id");
            setUser({ loggedIn: false, token: null, id: null });
          }}>
            Log Out
          </button>
  
          <h1 style={styles.heading}>Welcome to the Hotel Management System</h1>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
          <h2>Add Room</h2>
          <form style={styles.form} onSubmit={(e) => {
            e.preventDefault();
            fetch("https://backend-hotel-gwse.onrender.com/api/rooms", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                name: e.target.name.value,
                price: e.target.price.value,
                hotel_id: user.id,
                description: e.target.description.value,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                setRooms([...rooms, data]);
                e.target.reset();
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }}>
            <input name="name" type="text" placeholder="Room Name" style={styles.input} />
            <input name="price" type="number" placeholder="Price" style={styles.input} />
            <input name="description" type="text" placeholder="Description" style={styles.input} />
            <button style={styles.button} type="submit">Add Room</button>
          </form>
  </div>
          <h2>Rooms</h2>
          {rooms.map((room) => (
            <div style={styles.card} key={room.id}>
              <h3>{room.name}</h3>
              <p>Price: ${room.price}</p>
              <p>{room.description}</p>
              <button style={{ ...styles.button, backgroundColor: "#f44336" }} onClick={() => deleteRoom(room.id)}>
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
