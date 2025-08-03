document.getElementById("terminal-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const value = this.value.trim().toLowerCase();
      if (value === "admin") {
        window.location.href = "https://api.ahamedwajibu.com/admin-login";  
      }
    }
  });