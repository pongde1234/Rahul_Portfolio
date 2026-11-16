// The picture of the add-devices prototype used on the work list and the home page: a still of the Add device pop-up over the
// Devices page (a screenshot of embed.html#choose), in a soft blue frame. The live prototype is in the case study.
export default function DevicesStill() {
  return (
    <div
      className="art"
      role="img"
      aria-label="Adding hundreds of devices from one Excel sheet: the Devices page with the Add device pop-up open"
      style={{ display: 'grid', placeItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, var(--global-sapphire-50), var(--global-sapphire-100))' }}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/devices/prototype-still.png`}
        alt=""
        draggable="false"
        style={{ width: '80%', height: 'auto', borderRadius: 10, boxShadow: '0 1px 2px rgba(22,24,29,0.06), 0 14px 32px -12px rgba(22,24,29,0.28)' }}
      />
    </div>
  )
}
