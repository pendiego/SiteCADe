import { describe, expect, it } from 'vitest';
import {
  acessoConteudoEscrita,
  acessoConteudoPublico,
  acessoUsuarios,
  campoAtivoEditavel,
  campoPapelEditavel,
  podeAlterarAtividade,
  podeAlterarPapel,
  podeAtualizarProprioPerfil,
  podeAutenticar,
  podeGerenciarConteudo,
  podeGerenciarUsuarios,
  podeLerProprioPerfil,
} from '@/cms/access';

const admin = { id: 1, papel: 'administrador', ativo: true };
const editor = { id: 2, papel: 'editor', ativo: true };
const outroEditor = { id: 3, papel: 'editor', ativo: true };
const adminDesativado = { id: 4, papel: 'administrador', ativo: false };
const editorDesativado = { id: 5, papel: 'editor', ativo: false };
const semPapel = { id: 6, papel: 'visitante', ativo: true };

// Access do Payload recebe { req } com o usuário da sessão.
const com = (user: unknown) => ({ req: { user } }) as never;

describe('visitante anônimo', () => {
  it('não autentica, não gerencia conteúdo nem usuários', () => {
    expect(podeAutenticar(null)).toBe(false);
    expect(podeAutenticar(undefined)).toBe(false);
    expect(podeGerenciarConteudo(null)).toBe(false);
    expect(podeGerenciarUsuarios(null)).toBe(false);
    expect(acessoUsuarios.create(com(null))).toBe(false);
    expect(acessoUsuarios.read(com(null))).toBe(false);
    expect(acessoUsuarios.update(com(null))).toBe(false);
    expect(acessoUsuarios.delete(com(null))).toBe(false);
  });

  it('lê conteúdo público, mas não escreve conteúdo', () => {
    expect(acessoConteudoPublico(com(null))).toBe(true);
    expect(acessoConteudoEscrita(com(null))).toBe(false);
  });
});

describe('usuário desativado', () => {
  it.each([adminDesativado, editorDesativado])('é negado em tudo (%j)', (u) => {
    expect(podeAutenticar(u)).toBe(false);
    expect(podeGerenciarConteudo(u)).toBe(false);
    expect(podeGerenciarUsuarios(u)).toBe(false);
    expect(podeAlterarPapel(u)).toBe(false);
    expect(podeAlterarAtividade(u)).toBe(false);
    expect(podeLerProprioPerfil(u, u.id)).toBe(false);
    expect(podeAtualizarProprioPerfil(u, u.id)).toBe(false);
    expect(acessoUsuarios.read(com(u))).toBe(false);
    expect(acessoUsuarios.update(com(u))).toBe(false);
    expect(acessoConteudoEscrita(com(u))).toBe(false);
  });
});

describe('editor', () => {
  it('autentica e gerencia conteúdo', () => {
    expect(podeAutenticar(editor)).toBe(true);
    expect(podeGerenciarConteudo(editor)).toBe(true);
    expect(acessoConteudoEscrita(com(editor))).toBe(true);
  });

  it('não cria, exclui nem gerencia outros usuários', () => {
    expect(podeGerenciarUsuarios(editor)).toBe(false);
    expect(acessoUsuarios.create(com(editor))).toBe(false);
    expect(acessoUsuarios.delete(com(editor))).toBe(false);
  });

  it('não promove papel nem altera atividade, nem no próprio perfil', () => {
    expect(podeAlterarPapel(editor)).toBe(false);
    expect(podeAlterarAtividade(editor)).toBe(false);
    expect(campoPapelEditavel(com(editor))).toBe(false);
    expect(campoAtivoEditavel(com(editor))).toBe(false);
  });

  it('lê e atualiza apenas o próprio perfil', () => {
    expect(podeLerProprioPerfil(editor, editor.id)).toBe(true);
    expect(podeAtualizarProprioPerfil(editor, editor.id)).toBe(true);
    expect(podeLerProprioPerfil(editor, outroEditor.id)).toBe(false);
    expect(podeAtualizarProprioPerfil(editor, outroEditor.id)).toBe(false);
  });

  it('o filtro de leitura e atualização é o próprio id', () => {
    expect(acessoUsuarios.read(com(editor))).toEqual({ id: { equals: editor.id } });
    expect(acessoUsuarios.update(com(editor))).toEqual({ id: { equals: editor.id } });
  });

  it('usuário ativo sem papel reconhecido não gerencia conteúdo', () => {
    expect(podeGerenciarConteudo(semPapel)).toBe(false);
    expect(podeAtualizarProprioPerfil(semPapel, semPapel.id)).toBe(false);
  });
});

describe('administrador', () => {
  it('gerencia usuários, papel e atividade', () => {
    expect(podeGerenciarUsuarios(admin)).toBe(true);
    expect(podeAlterarPapel(admin)).toBe(true);
    expect(podeAlterarAtividade(admin)).toBe(true);
    expect(campoPapelEditavel(com(admin))).toBe(true);
    expect(campoAtivoEditavel(com(admin))).toBe(true);
    expect(acessoUsuarios.create(com(admin))).toBe(true);
    expect(acessoUsuarios.delete(com(admin))).toBe(true);
    expect(acessoUsuarios.read(com(admin))).toBe(true);
  });

  it('atualiza o perfil de qualquer usuário', () => {
    expect(podeAtualizarProprioPerfil(admin, editor.id)).toBe(true);
    expect(podeLerProprioPerfil(admin, editor.id)).toBe(true);
  });
});
