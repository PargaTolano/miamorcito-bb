import React, { useEffect, useMemo, useState, useRef } from "react";

import miMayorAnhelo from "./sound/banda_ms__mi_mayor_anhelo.mp3";

import moon from "./img/moon-1859616.jpg";
import gatoFlores from "./img/gato-flores.png";

import trumpet from "./img/trumpet-cat.png";
import tuba from "./img/tuba-cat.png";
import drums from "./img/drums-cat.png";

import vikingos from "./img/vikingos.png";

import dialogosJson from "./data/dialogos.json";
import catJson from "./data/bandCats.json";

const { dialogos } = dialogosJson;

const { cats } = catJson;

const catMap = {
  trumpet,
  tuba,
  drums,
};

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

const period = 1;
function Dialogo({ open, finalOpen, setFinalOpen }) {
  const [idx, setIdx] = useState(0);

  const dialogo = useMemo(() => dialogos[idx], [idx]);

  useEffect(() => {
    (async () => {
      if (!open) {

        if (dialogo.waitBefore) 
          await wait(dialogo.waitBefore / period);
        await wait(dialogo.duration / period);
        if (dialogo.waitAfter) 
          await wait(dialogo.waitAfter / period);

        if (idx !== dialogos.length - 1)
          setIdx((prev) => prev + 1); 
        else
          setTimeout( () => setFinalOpen(true), 1000);
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
            animationDelay: `${dialogo.waitBefore / period}ms`,
            animationDuration: `${dialogo.duration / period}ms`,
            ...(dialogo.nowrap ? { whiteSpace: "nowrap" } : {}),
          }}
        >
          {dialogo.content} {finalOpen.toString()}
        </p>
      )}
    </>
  );
}

function App() {
  const [open, setOpen] = useState(true);
  const [finalOpen, setFinalOpen] = useState(false);

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
        />

        <Dialogo open={open} finalOpen={finalOpen} setFinalOpen={setFinalOpen} />

        {
          // aggregar gatos de banda uno a uno
          cats.map((cat, idx) => (
            <Cat key={idx} cat={cat} open={open} scale={factors[idx] / 255} />
          ))
        }

        <div
          className={`fixed w-full h-full bg-black/60 flex justify-center items-center z-40 ${
            finalOpen ? "" : "invisible"
          }`}
        >
          <div
            className={`${
              finalOpen ? "opacity-100" : "opacity-0"
            } ${
              finalOpen ? "-translate-y-10" : "-translate-y-0"
            } duration-700 delay-700 transition-all`}
          >
            <h1 className="text-white size text-center text-6xl mb-6">❤️ Feliz San Valentin ❤️</h1>
            <img className="mx-auto" src={vikingos} alt="vikingos" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
