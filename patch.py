import sys

with open(r'c:\Users\Bedirhan\Desktop\Carvis-App\Carvis\src\context\WalletContext.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add state
content = content.replace(
    '  }, [currentUser, fetchWalletData]);\n\n  const addFunds = async (amount) => {',
    '  }, [currentUser, fetchWalletData]);\n\n  const [isAddingFunds, setIsAddingFunds] = useState(false);\n\n  const addFunds = async (amount) => {'
)

# Add setIsAddingFunds(true)
content = content.replace(
    '  const addFunds = async (amount) => {\n    if (amount <= 0) return false;\n    try {',
    '  const addFunds = async (amount) => {\n    if (amount <= 0) return false;\n    setIsAddingFunds(true);\n    try {'
)

# Add finally block
content = content.replace(
    '    } catch (error) {\n      console.error("Add funds error:", error);\n      showAlert("Hata", "Bakiye yüklenemedi.", "error");\n      return false;\n    }\n  };',
    '    } catch (error) {\n      console.error("Add funds error:", error);\n      showAlert("Hata", "Bakiye yüklenemedi.", "error");\n      return false;\n    } finally {\n      setIsAddingFunds(false);\n    }\n  };'
)

# Add to value export
content = content.replace(
    '    transactions,\n    addFunds,',
    '    transactions,\n    isAddingFunds,\n    addFunds,'
)

with open(r'c:\Users\Bedirhan\Desktop\Carvis-App\Carvis\src\context\WalletContext.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
