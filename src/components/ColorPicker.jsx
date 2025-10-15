import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";

function ColorPicker({ color, onChange }) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const PickerOverlay = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="p-4 bg-neutral-950 border border-neutral-700 rounded shadow-lg relative">
        <HexColorPicker color={color} onChange={onChange} />
        <div className="mt-4 flex justify-center relative">
          <div className="relative flex items-center">
          <button
            type="button"
            className="relative px-4 py-1 rounded text-white text-sm overflow-hidden"
            style={{ backgroundColor: color }}
            onClick={() => setPickerVisible(false)}
          >
            <span className="absolute left-1/2 top-1/2 w-17 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/30 blur-md" />
            <span className="relative z-10">Select</span>
          </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="w-8 h-7 rounded border border-neutral-700 cursor-pointer hover:opacity-80 transition"
        style={{ backgroundColor: color }}
        onClick={() => setPickerVisible(true)}
      />
      {pickerVisible && createPortal(<PickerOverlay />, document.body)}
    </>
  );
}

export default ColorPicker;