document.getElementById("terminal-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const value = this.value.trim().toLowerCase();

      // YEEESSS I KNOW THIS IS UNSAFE STOOOP 
      if (value === "admin") {
        window.location.href = "https://api.ahamedwajibu.com/admin-login";  
      }
    }
  });