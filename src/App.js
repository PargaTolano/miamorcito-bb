import React, { useEffect, useMemo, useState, useRef } from "react";

import miMayorAnhelo from "./sound/banda_ms__mi_mayor_anhelo.mp3";

import moon from "./img/moon-1859616.jpg";
import gatoFlores from "./img/gato-flores.png";

import trumpet from "./img/trumpet-cat.png";
import tuba from "./img/tuba-cat.png";
import drums from "./img/drums-cat.png";

import dialogosJson from "./data/dialogos.json";
import catJson from "./data/bandCats.json";

const { dialogos } = dialogosJson;

const { cats } = catJson;

const catMap = {
  trumpet,
  tuba,
  drums,
};

// audio file
async function getAudioFile() {}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Overlay({ open, setOpen }) {
  return (
    <div
      className={`fixed w-full h-full bg-black/70 flex justify-center items-center ${
        open ? "" : "invisible"
      } z-30`}
    >
      <button
        className="bg-violet-400 hover:bg-blue-300 text-white px-6 py-3 rounded-full transition-colors duration-150"
        onClick={() => setOpen(false)}
      >
        Presiona aqui para comenzar si eres miamorcito 💕
      </button>
    </div>
  );
}

function Cat({
  open,
  scale,
  cat: { scaleFactor = 0.1, type, position, zIndex, ...style },
}) {
  return (
    <div
      className="absolute"
      style={{
        ...position,
        transform: `scale(${1 + scale * scaleFactor})`,
        zIndex,
      }}
    >
      <img
        className={`transition-all ${open ? "opacity-0" : "opacity-100"}`}
        style={{ ...style }}
        src={catMap[type]}
        alt={type}
      />
    </div>
  );
}

function Dialogo({ open, setFinalOpen }) {
  const [idx, setIdx] = useState(0);

  const dialogo = useMemo(() => dialogos[idx], [idx]);

  useEffect(() => {
    (async () => {
      if (!open) {
        // start dialog sequence
        if (dialogo.waitBefore) {
          // chain from here
          await wait(dialogo.waitBefore/5);
        }
        await wait(dialogo.duration/5);
        if (dialogo.waitAfter) {
          await wait(dialogo.waitAfter/5);
        }
        if (idx !== dialogos.length - 1)
          setIdx((prev) => prev + 1);
      } else if (idx === dialogos.length -1) {
        // mostrar final

      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idx]);

  return (
    <>
      {!open && (
        <p
          key={idx}
          className="dialog-text absolute left-1/2 top-1/4 text-white z-20 w-96 text-4xl font-bold"
          style={{
            animationFillMode: "both",
            animationDelay: `${dialogo.waitBefore/5}ms`,
            animationDuration: `${dialogo.duration/5}ms`,
            ...(dialogo.nowrap ? { whiteSpace: 'nowrap'}: {}),
          }}
        >
          {dialogo.content}
        </p>
      )}
    </>
  );
}

function App() {
  const [open, setOpen] = useState(true);

  const audio = useMemo(() => new Audio(miMayorAnhelo), []);

  const audioSource = useRef();
  const analyser = useRef();
  const buffer = useRef(new Uint8Array());

  const [factors, setFactors] = useState(Array.from({ length: 6 }, () => 0));

  // animate cats
  const requestRef = useRef();
  const animate = () => {
    analyser.current.getByteFrequencyData(buffer.current);
    setFactors(buffer.current.slice(0, 6));
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!open) {
      // start animation and audio logic
      const ctx = new AudioContext();
      audio.play();
      audioSource.current = ctx.createMediaElementSource(audio);
      analyser.current = ctx.createAnalyser();

      audioSource.current.connect(analyser.current);
      analyser.current.connect(ctx.destination);

      buffer.current = new Uint8Array(analyser.current.frequencyBinCount);

      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <Overlay open={open} setOpen={setOpen} />
      <div
        className="relative w-full h-full overflow-hidden bg-cover"
        style={{ backgroundImage: `url(${moon})` }}
      >
        <img
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${
            open ? "opacity-0" : "opacity-100"
          } transition-opacity duration-1000 delay-1000 z-20`}
          src={gatoFlores}
          alt="gato-flores"
        />

        <div
          className={`fixed w-full h-full bg-black/60 flex justify-center items-center ${
            open ? "opacity-0" : "opacity-100"
          } z-10 transition-opacity duration-1000 delay-19000`}
        ></div>

        {/* TODO: Agregar texto */}
        <Dialogo open={open} />

        {/* TODO: Hacer crecer y encongerse a los gatos en base a los valores del audio en spikes */}
        {
          // aggregar gatos de banda uno a uno
          cats.map((cat, idx) => (
            <Cat key={idx} cat={cat} open={open} scale={factors[idx] / 255} />
          ))
        }
      </div>
    </>
  );
}

export default App;
