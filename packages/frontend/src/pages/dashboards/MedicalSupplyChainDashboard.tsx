import React from 'react';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Truck,
  Activity,
  Shield,
  BarChart2,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Users
} from 'lucide-react';
import DashboardTemplate, {
  DashboardConfig,
  ChartConfig,
  renderChart,
  CHART_COLORS
} from '../../components/dashboards/DashboardTemplate';
import { UseCase } from '../../config/verticals';
import { healthcareDataGenerators } from '../../utils/dashboard-data-generators';
import { motion } from 'framer-motion';

interface MedicalSupplyChainDashboardProps {
  useCase: UseCase;
}

const MedicalSupplyChainDashboard: React.FC<MedicalSupplyChainDashboardProps> = ({ useCase }) => {
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const data = healthcareDataGenerators.medicalSupplyChain();

  // Overview Tab Content
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Supply Chain Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 text-blue-500 mr-2" />
          Medical Supply Chain Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
            <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.supplyMetrics.totalItems.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Items Tracked</p>
            <p className="text-xs text-green-500 mt-1">↑ 8% inventory growth</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.supplyMetrics.criticalItems}</p>
            <p className="text-sm text-gray-500">Critical Items</p>
            <p className="text-xs text-red-500 mt-1">Need attention</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.supplyMetrics.supplierReliability}%</p>
            <p className="text-sm text-gray-500">Supplier Reliability</p>
            <p className="text-xs text-green-500 mt-1">↑ 2.3% improvement</p>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{data.supplyMetrics.emergencyCapacity}%</p>
            <p className="text-sm text-gray-500">Emergency Capacity</p>
            <p className="text-xs text-purple-500 mt-1">Crisis readiness</p>
          </div>
        </div>
      </motion.div>

      {/* Inventory Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Current Inventory Status</h3>
        <div className="space-y-4">
          {data.inventoryStatus.map((category, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{category.category}</p>
                  <p className="text-sm text-gray-500">
                    Stock: {category.stock.toLocaleString()} • Usage: {category.usage.toLocaleString()}/day
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{category.daysSupply}</p>
                  <p className="text-xs text-gray-500">Days Supply</p>
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    category.daysSupply >= 30 ? 'bg-green-500' :
                    category.daysSupply >= 14 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((category.daysSupply / 60) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Supply Chain Risk Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supply Chain Risk Trend</h3>
        {renderChart({
          type: 'area',
          title: '30-Day Risk Score',
          data: data.supplyChainRisk,
          dataKeys: ['date', 'value'],
          colors: [CHART_COLORS[3]],
          height: 300
        }, isDarkMode)}
      </motion.div>
    </div>
  );

  // Critical Alerts Tab
  const renderAlertsTab = () => (
    <div className="space-y-6">
      {/* Critical Item Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          Critical Supply Alerts
        </h3>
        <div className="space-y-3">
          {data.criticalAlerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              alert.risk === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
              alert.risk === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{alert.item}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alert.daysRemaining} days remaining • Action: {alert.action}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.risk === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    alert.risk === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {alert.risk.toUpperCase()} RISK
                  </span>
                  {alert.risk === 'high' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stockout Risk Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Stockout Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium mb-2 text-red-700 dark:text-red-300">High Risk (&lt; 7 days)</h4>
            <p className="text-3xl font-bold text-red-600">{data.supplyMetrics.stockoutRisk}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Of critical items</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>• N95 Masks</li>
              <li>• Ventilator Filters</li>
              <li>• IV Fluids</li>
            </ul>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium mb-2 text-yellow-700 dark:text-yellow-300">Medium Risk (7-14 days)</h4>
            <p className="text-3xl font-bold text-yellow-600">18%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Of critical items</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>• Surgical Gloves</li>
              <li>• Antibiotics</li>
              <li>• Syringes</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">Low Risk (&gt; 14 days)</h4>
            <p className="text-3xl font-bold text-green-600">70%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Of critical items</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>• Bandages</li>
              <li>• Basic Medications</li>
              <li>• Cleaning Supplies</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Emergency Response Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Emergency Response Actions</h3>
        <div className="space-y-3">
          {[
            { action: 'Activate Emergency Suppliers', status: 'ready', impact: 'High', time: 'Immediate' },
            { action: 'Redistribute Regional Stock', status: 'available', impact: 'Medium', time: '2-4 hours' },
            { action: 'Fast-track Pending Orders', status: 'processing', impact: 'Medium', time: '24 hours' },
            { action: 'Implement Conservation Protocols', status: 'ready', impact: 'Low', time: 'Immediate' }
          ].map((action, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium">{action.action}</p>
                <p className="text-sm text-gray-500">Response time: {action.time}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  action.impact === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  action.impact === 'Medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {action.impact} Impact
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  action.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  action.status === 'available' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {action.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Supplier Performance Tab
  const renderSupplierTab = () => (
    <div className="space-y-6">
      {/* Supplier Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supplier Performance Analysis</h3>
        <div className="space-y-4">
          {data.supplierPerformance.map((supplier, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{supplier.supplier}</p>
                  <p className="text-sm text-gray-500">{supplier.orders} orders completed</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{supplier.reliability}%</p>
                  <p className="text-xs text-gray-500">Reliability Score</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Avg Lead Time</p>
                  <p className="font-medium">{supplier.leadTime} days</p>
                </div>
                <div>
                  <p className="text-gray-500">On-Time Delivery</p>
                  <p className="font-medium">{Math.round(supplier.reliability * 0.95)}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Quality Score</p>
                  <p className="font-medium">{Math.round(supplier.reliability * 0.98)}%</p>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    supplier.reliability >= 95 ? 'bg-green-500' :
                    supplier.reliability >= 90 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${supplier.reliability}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Supplier Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Supplier Performance Comparison</h3>
        {renderChart({
          type: 'radar',
          title: 'Multi-factor Analysis',
          data: data.supplierPerformance.map(s => ({
            subject: s.supplier,
            reliability: s.reliability,
            speed: 100 - (s.leadTime * 20),
            volume: s.orders / 5
          })),
          dataKeys: ['reliability', 'speed', 'volume'],
          colors: [CHART_COLORS[0], CHART_COLORS[1], CHART_COLORS[2]],
          height: 400
        }, isDarkMode)}
      </motion.div>

      {/* Alternative Suppliers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Alternative Supplier Network</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-3">Primary Alternatives</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Global Medical Direct</span>
                <span className="text-green-500">Available</span>
              </li>
              <li className="flex justify-between">
                <span>Healthcare Supply Pro</span>
                <span className="text-green-500">Available</span>
              </li>
              <li className="flex justify-between">
                <span>MedTech Solutions</span>
                <span className="text-yellow-500">Limited</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium mb-3">Emergency Suppliers</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Crisis Medical Supply</span>
                <span className="text-green-500">24/7 Ready</span>
              </li>
              <li className="flex justify-between">
                <span>Rapid Response Medical</span>
                <span className="text-green-500">On Standby</span>
              </li>
              <li className="flex justify-between">
                <span>Emergency Health Logistics</span>
                <span className="text-green-500">Active</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Crisis Management Tab
  const renderCrisisTab = () => (
    <div className="space-y-6">
      {/* Crisis Readiness Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 text-purple-500 mr-2" />
          Crisis Management Readiness
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Package className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.crisisReadiness.emergencyStock}%</p>
            <p className="text-sm text-gray-500">Emergency Stock</p>
            <p className="text-xs text-green-500">Above minimum</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.crisisReadiness.responseTime}h</p>
            <p className="text-sm text-gray-500">Response Time</p>
            <p className="text-xs text-green-500">↓ 30min faster</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Truck className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.crisisReadiness.alternativeSuppliers}</p>
            <p className="text-sm text-gray-500">Alt. Suppliers</p>
            <p className="text-xs text-blue-500">Pre-qualified</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <CheckCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data.crisisReadiness.contingencyPlans}</p>
            <p className="text-sm text-gray-500">Active Plans</p>
            <p className="text-xs text-orange-500">Updated weekly</p>
          </div>
        </div>
      </motion.div>

      {/* Crisis Scenarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Crisis Scenario Planning</h3>
        <div className="space-y-4">
          {[
            { 
              scenario: 'Pandemic Surge', 
              readiness: 92, 
              resources: 'PPE, Ventilators, ICU Supplies',
              response: 'Activate emergency suppliers, implement surge protocols'
            },
            { 
              scenario: 'Natural Disaster', 
              readiness: 88, 
              resources: 'Emergency Kits, Trauma Supplies, Generators',
              response: 'Deploy mobile units, coordinate with regional centers'
            },
            { 
              scenario: 'Supply Chain Disruption', 
              readiness: 85, 
              resources: 'Critical Medications, Basic Supplies',
              response: 'Switch to alternative suppliers, implement rationing'
            },
            { 
              scenario: 'Mass Casualty Event', 
              readiness: 90, 
              resources: 'Blood Products, Surgical Supplies, Anesthetics',
              response: 'Activate trauma protocols, request regional support'
            }
          ].map((scenario, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{scenario.scenario}</p>
                  <p className="text-sm text-gray-500">Key resources: {scenario.resources}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{scenario.readiness}%</p>
                  <p className="text-xs text-gray-500">Readiness</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Response: {scenario.response}
              </p>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    scenario.readiness >= 90 ? 'bg-green-500' :
                    scenario.readiness >= 85 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${scenario.readiness}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Resource Allocation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
      >
        <h3 className="text-lg font-semibold mb-4">Emergency Resource Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Resource Distribution</h4>
            {renderChart({
              type: 'pie',
              title: 'Emergency Stock Allocation',
              data: [
                { name: 'Critical Care', value: 35 },
                { name: 'Emergency Medicine', value: 25 },
                { name: 'General Supplies', value: 20 },
                { name: 'Pharmaceuticals', value: 15 },
                { name: 'Reserve', value: 5 }
              ],
              dataKeys: ['value'],
              colors: CHART_COLORS,
              height: 250
            }, isDarkMode)}
          </div>
          <div>
            <h4 className="font-medium mb-3">Response Capabilities</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Surge Capacity</span>
                  <span className="font-medium">+250%</span>
                </div>
                <p className="text-xs text-gray-500">Within 24 hours</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Staff Mobilization</span>
                  <span className="font-medium">1,200</span>
                </div>
                <p className="text-xs text-gray-500">Emergency personnel</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Distribution Points</span>
                  <span className="font-medium">47</span>
                </div>
                <p className="text-xs text-gray-500">Active locations</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Transport Fleet</span>
                  <span className="font-medium">85</span>
                </div>
                <p className="text-xs text-gray-500">Vehicles ready</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const config: DashboardConfig = {
    title: 'Medical Supply Chain & Crisis Orchestration',
    description: 'AI-powered supply chain management and crisis response coordination',
    kpis: [
      {
        title: 'Total Items',
        value: data.supplyMetrics.totalItems.toLocaleString(),
        change: 8.0,
        icon: Package,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Critical Items',
        value: data.supplyMetrics.criticalItems,
        change: -12.5,
        icon: AlertTriangle,
        color: 'red',
        trend: 'down'
      },
      {
        title: 'Emergency Ready',
        value: `${data.supplyMetrics.emergencyCapacity}%`,
        change: 5.3,
        icon: Shield,
        color: 'purple',
        trend: 'up'
      }
    ],
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: BarChart2,
        content: renderOverviewTab
      },
      {
        id: 'alerts',
        label: 'Critical Alerts',
        icon: AlertCircle,
        content: renderAlertsTab
      },
      {
        id: 'suppliers',
        label: 'Supplier Performance',
        icon: Truck,
        content: renderSupplierTab
      },
      {
        id: 'crisis',
        label: 'Crisis Management',
        icon: Shield,
        content: renderCrisisTab
      }
    ]
  };

  return <DashboardTemplate config={config} useCase={useCase} />;
};

export default MedicalSupplyChainDashboard;