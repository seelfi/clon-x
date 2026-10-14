
import Sidebar from './components/Sidebar'
import Feed from './components/Feed'
import RightPanel from './components/RightPanel'
import './styles/App.css'

function App() {
  return (
    <div className="layout">
      <Sidebar />
      <Feed />
      <RightPanel />
    </div>
  )
}

export default App
