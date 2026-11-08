/** Texte enrichi minimal : **gras** et typographie française (espaces insécables). */
import { Fragment } from 'react';

/** Espaces fines insécables avant ? ! ; : et à l'intérieur des guillemets français. */
export function frTypo(s: string): string {
  return s
    .replace(/ ([?!;:»])/g, '\u202f$1')
    .replace(/« /g, '«\u202f');
}

export function Rich({ text }: { text: string }) {
  const parts = frTypo(text).split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}
