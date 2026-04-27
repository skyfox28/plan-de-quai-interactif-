import Scene from './components/Scene'
import Panel from './components/Panel'
import StatsBar from './components/StatsBar'
import Legend from './components/Legend'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <StatsBar />
      <div className="workspace">
        <div className="canvas-wrap">
          <Scene />
          <Legend />
          <div className="canvas-hint">
            Clic gauche : rotation · Clic droit : déplacement · Molette : zoom
          </div>
        </div>
        <Panel />
      </div>
    </div>
  )
}
