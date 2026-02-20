const formData = new FormData();
formData.append("email", email);
formData.append("title", title);
formData.append("description", description);
formData.append("file", selectedFile);

fetch("http://localhost:8080/api/certification", {
  method: "POST",
  body: formData
});

// Important:

// 👉 DO NOT set Content-Type manually
// Browser automatically sets multipart/form-data