'use client';

import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { DIAS, HORARIOS, idHorario } from '@/lib/disponibilidade';
import type { InicioFormularios } from '@/lib/tipos';

type Formulario = 'participar' | 'falar';
type Tipo = 'reclamacao' | 'sugestao' | 'elogio' | 'oportunidade';
const TIPOS: Tipo[] = ['reclamacao', 'sugestao', 'elogio', 'oportunidade'];


interface Props {
  textos: InicioFormularios;
}

export default function Formularios({ textos }: Props) {
  const [estados, setEstados] = useState<Record<Formulario, 'enviando' | 'sucesso' | null>>({ participar: null, falar: null });
  const [erros, setErros] = useState<Record<Formulario, string | null>>({ participar: null, falar: null });
  const [tipo, setTipo] = useState<Tipo>('elogio');
  const [anonimo, setAnonimo] = useState(false);
  const [contato, setContato] = useState('');
  const temporizadores = useRef<Record<Formulario, number | undefined>>({ participar: undefined, falar: undefined });

  useEffect(() => () => {
    window.clearTimeout(temporizadores.current.participar);
    window.clearTimeout(temporizadores.current.falar);
  }, []);

  const enviar = async (formulario: Formulario, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const dados: Record<string, unknown> = Object.fromEntries(new FormData(form));
    if (formulario === 'falar') dados.anonimo = anonimo;
    if (formulario === 'participar') {
      const disponibilidade = new FormData(form).getAll('disponibilidade');
      if (disponibilidade.length === 0) {
        setErros((atual) => ({ ...atual, participar: textos.participar.disponibilidadeErro }));
        form.querySelector<HTMLInputElement>('input[name="disponibilidade"]')?.focus();
        return;
      }
      dados.disponibilidade = disponibilidade;
    }

    setEstados((atual) => ({ ...atual, [formulario]: 'enviando' }));
    setErros((atual) => ({ ...atual, [formulario]: null }));
    try {
      const res = await fetch('/api/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, formulario }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(String(res.status));
      setEstados((atual) => ({ ...atual, [formulario]: 'sucesso' }));
      window.clearTimeout(temporizadores.current[formulario]);
      temporizadores.current[formulario] = window.setTimeout(() => {
        form.reset();
        if (formulario === 'falar') {
          setTipo('elogio');
          setAnonimo(false);
          setContato('');
        }
        setEstados((atual) => ({ ...atual, [formulario]: null }));
      }, 2200);
    } catch {
      setErros((atual) => ({ ...atual, [formulario]: textos.mensagens.erro }));
      setEstados((atual) => ({ ...atual, [formulario]: null }));
    }
  };

  const statusDe = (formulario: Formulario) => (
    <p className="form-nota form-nota--erro" aria-live="polite" hidden={!erros[formulario]}>
      {erros[formulario]}
    </p>
  );

  const p = textos.participar;
  const f = textos.falar;

  return (
    <section className="sec wrap" data-od-id="participe">
      <img className="mascote-canto" src="/assets/mascote-forms.svg" alt="" width={176} height={131} />
      <div className="sec-head">
        <p className="eyebrow">{textos.eyebrow}</p>
        <h2 className="h-sec">{textos.titulo}</h2>
      </div>

      <div className="forms">
        <form
          className="form"
          id="form-participar"
          data-od-id="form-participar"
          action="/api/enviar"
          method="POST"
          onSubmit={(e) => enviar('participar', e)}
        >
          <h3>{p.titulo}</h3>
          <p>{p.texto}</p>

          <div className="campo">
            <label htmlFor="p-nome">{p.nomeRotulo}</label>
            <input id="p-nome" name="nome" type="text" placeholder={p.nomePlaceholder} required />
          </div>
          <div className="campo">
            <label htmlFor="p-email">{p.emailRotulo}</label>
            <input id="p-email" name="email" type="email" placeholder={p.emailPlaceholder} required />
          </div>
          <div className="campo-duplo">
            <div className="campo">
              <label htmlFor="p-semestre">{p.semestreRotulo}</label>
              <select id="p-semestre" name="semestre" defaultValue="">
                <option value="">{p.selecione}</option>
                {p.semestres.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="p-area">{p.areaRotulo}</label>
              <select id="p-area" name="area" defaultValue="">
                <option value="">{p.selecione}</option>
                {p.areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
          <fieldset className="disp" data-od-id="disponibilidade-participar">
            <legend>{p.disponibilidadeRotulo}</legend>
            <p className="form-nota">{p.disponibilidadeAjuda}</p>
            <div className="disp-grade">
              <span aria-hidden="true" />
              {DIAS.map((dia) => (
                <span key={dia.id} className="disp-dia" aria-hidden="true">{dia.curto}</span>
              ))}
              {HORARIOS.map((horario) => (
                <Fragment key={horario}>
                  <span className="disp-hora" aria-hidden="true">{horario}</span>
                  {DIAS.map((dia) => {
                    const id = idHorario(dia.id, horario);
                    return (
                      <label key={id} className="disp-cel">
                        <input
                          type="checkbox"
                          name="disponibilidade"
                          value={id}
                          aria-label={`${dia.rotulo}, ${horario}`}
                          data-od-id={`disponibilidade-${id.replace(':', '')}`}
                        />
                        <span aria-hidden="true" />
                      </label>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </fieldset>

          <input className="hp" type="text" name="empresa" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className="btn btn--primary btn--bloco" type="submit" data-od-id="cta-participar" disabled={estados.participar !== null}>
            {estados.participar ? textos.mensagens[estados.participar] : p.enviarRotulo}
            {!estados.participar && <span className="m-icon" aria-hidden="true">{'\ue5c8'}</span>}
          </button>
          <p className="form-nota">{p.nota}</p>
          {statusDe('participar')}
        </form>

        <form
          className="form"
          id="form-falar"
          data-od-id="form-falar"
          action="/api/enviar"
          method="POST"
          onSubmit={(e) => enviar('falar', e)}
        >
          <h3>{f.titulo}</h3>
          <p id="nota-tipo">{textos.falar.tipos[tipo].nota}</p>

          <fieldset className="campo" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 600, padding: '0 0 8px' }}>{f.tipoRotulo}</legend>
            <div className="pills" data-od-id="pills-tipo">
              {TIPOS.map((t) => (
                <label className="pill" key={t}>
                  <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} />
                  <span>{f.tipos[t].rotulo}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="campo">
            <label htmlFor="f-assunto">{f.assuntoRotulo}</label>
            <input id="f-assunto" name="assunto" type="text" placeholder={f.assuntoPlaceholder} required />
          </div>
          <div className="campo">
            <label htmlFor="f-msg">{f.mensagemRotulo}</label>
            <textarea id="f-msg" name="mensagem" placeholder={f.mensagemPlaceholder} required />
          </div>

          <label className="check" data-od-id="check-anonimo">
            <input
              type="checkbox"
              name="anonimo"
              id="f-anonimo"
              checked={anonimo}
              onChange={(e) => {
                setAnonimo(e.target.checked);
                if (e.target.checked) setContato('');
              }}
            />
            {f.anonimoRotulo}
          </label>

          <div className="campo">
            <label htmlFor="f-contato">{f.contatoRotulo}</label>
            <input
              id="f-contato"
              name="contato"
              type="text"
              placeholder={f.contatoPlaceholder}
              disabled={anonimo}
              style={{ opacity: anonimo ? 0.5 : undefined }}
              value={contato}
              onChange={(e) => setContato(e.target.value)}
            />
          </div>

          <p className="form-nota" id="nota-anonimo">{f.notaAnonimo}</p>

          <input className="hp" type="text" name="empresa" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button className="btn btn--navy btn--bloco" type="submit" data-od-id="cta-enviar" disabled={estados.falar !== null}>
            {estados.falar ? textos.mensagens[estados.falar] : f.enviarRotulo}
          </button>
          {statusDe('falar')}
        </form>
      </div>
    </section>
  );
}
