// Secure AES-256 Encryption Module
const SecureEncryption = {
  // Password for application access
  APP_PASSWORD: "Vital123",

  // Encrypt data using AES-256
  encrypt(data, password = this.APP_PASSWORD) {
    try {
      const encrypted = window.CryptoJS.AES.encrypt(data, password)
      return encrypted.toString()
    } catch (error) {
      console.error("Encryption error:", error)
      throw new Error("Failed to encrypt data")
    }
  },

  // Decrypt data using AES-256
  decrypt(encryptedData, password = this.APP_PASSWORD) {
    try {
      const decrypted = window.CryptoJS.AES.decrypt(encryptedData, password)
      return decrypted.toString(window.CryptoJS.enc.Utf8)
    } catch (error) {
      console.error("Decryption error:", error)
      throw new Error("Failed to decrypt data")
    }
  },

  // Encrypt file content
  encryptFile(fileContent) {
    return this.encrypt(fileContent)
  },

  // Decrypt file content
  decryptFile(encryptedContent) {
    return this.decrypt(encryptedContent)
  },

  // Generate secure hash for password verification
  hashPassword(password) {
    return window.CryptoJS.SHA256(password).toString()
  },

  // Verify password
  verifyPassword(inputPassword) {
    return inputPassword === this.APP_PASSWORD
  },

  // Secure file reading with encryption
  async readFileSecurely(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target.result
          // Encrypt the content immediately after reading
          const encrypted = this.encryptFile(content)
          resolve({
            originalSize: content.length,
            encryptedContent: encrypted,
            fileName: file.name,
          })
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  },

  // Process Excel file with encryption
  async processExcelSecurely(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          // Read workbook
          const workbook = window.XLSX.read(data, { type: "array" })

          // Convert to JSON and encrypt
          const jsonData = {}
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName]
            const json = window.XLSX.utils.sheet_to_json(worksheet, { raw: true })
            jsonData[sheetName] = json
          })

          // Encrypt the JSON data
          const encrypted = this.encrypt(JSON.stringify(jsonData))

          resolve({
            workbook: workbook,
            data: jsonData,
            encryptedData: encrypted,
            fileName: file.name,
          })
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read Excel file"))
      reader.readAsArrayBuffer(file)
    })
  },
}

// Session management with encryption
const SecureSession = {
  isAuthenticated: false,
  sessionKey: null,

  authenticate(password) {
    if (SecureEncryption.verifyPassword(password)) {
      this.isAuthenticated = true
      this.sessionKey = SecureEncryption.hashPassword(password + Date.now())
      return true
    }
    return false
  },

  lock() {
    this.isAuthenticated = false
    this.sessionKey = null
  },

  check() {
    return this.isAuthenticated
  },
}
