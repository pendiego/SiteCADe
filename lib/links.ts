// Links de âncora vindos do conteúdo ("#area-cade") viram "/#area-cade" fora da home.
export function resolverHref(href: string, naHome: boolean): string {
  if (href.startsWith('#') && !naHome) return '/' + href;
  return href;
}

export function driveUrl(id: string): string {
  return `https://drive.google.com/drive/folders/${id}?usp=sharing`;
}
