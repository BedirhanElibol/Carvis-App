with open('src/features/home/CustomerHome.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
import_str = "import VehiclePassport from \"./components/VehiclePassport\";\nimport ProactiveAlerts from \"../../components/home/ProactiveAlerts\";\nimport FinancialCockpit from \"../../components/home/FinancialCockpit\";"
content = content.replace('import VehiclePassport from "./components/VehiclePassport";', import_str)

# 2. Add ProactiveAlerts
alert_insertion = """            {/* PROACTIVE ALERTS */}
            {activeVehicle && <ProactiveAlerts vehicle={activeVehicle} />}

            {/* VEHICLE COCKPIT MASTER MODULE */}"""
content = content.replace('            {/* VEHICLE COCKPIT MASTER MODULE */}', alert_insertion)

# 3. Add FinancialCockpit
financial_insertion = """                  </div>
                </div>
              </div>
            )}

            {/* FINANCIAL COCKPIT */}
            {activeVehicle && <FinancialCockpit vehicle={activeVehicle} />}

            {activeVehicle && searchAndCategoriesPanel}"""

target_block = """                  </div>
                </div>
              </div>
            )}

            {activeVehicle && searchAndCategoriesPanel}"""

content = content.replace(target_block, financial_insertion)

with open('src/features/home/CustomerHome.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Edited CustomerHome.jsx')
