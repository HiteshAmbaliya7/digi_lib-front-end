import '../styles/Loader.css'

export default function Loader({ fullScreen = true, text = 'Loading...' }) {
  return (
    <div className={fullScreen ? 'loader-overlay' : 'loader-inline'}>
      <div className="spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  )
}
