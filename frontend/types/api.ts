/** Respuesta envolvente estándar del backend NestJS */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
}

/** Respuesta envolvente para listas */
export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
}

/** Artículo / Equipo — mapea a la entidad `articulo` de Oracle */
export interface Articulo {
  idArt:  number;
  nomArt: string;
  desArt?: string;
  serArt?: string;
  marArt?: string;
  modArt?: string;
  canArt: number;
  valArt: number;
  estArt: number;
  idCat:  number;
  idEst:  number;
  idDep?: number;
  idUbi?: number;
  // relaciones opcionales que el backend puede popular
  categoria?: Categoria;
  ubicacion?: Ubicacion;
}

export interface CreateArticuloPayload {
  nomArt:  string;
  desArt?: string;
  serArt?: string;
  marArt?: string;
  modArt?: string;
  canArt:  number;
  valArt:  number;
  idCat:   number;
  idEst:   number;
  idDep?:  number;
  idUbi?:  number;
}

export type UpdateArticuloPayload = Partial<CreateArticuloPayload>;

/** Categoría */
export interface Categoria {
  idCat:  number;
  nomCat: string;
}

export interface CreateCategoriaPayload {
  nomCat: string;
}

/** Ubicación */
export interface Ubicacion {
  idUbi:  number;
  nomUbi: string;
  desUbi?: string;
  idDep:  number;
}

export interface CreateUbicacionPayload {
  nomUbi: string;
  desUbi?: string;
  idDep:  number;
}

/** Estado */
export interface Estado {
  idEst:  number;
  nomEst: string;
}

/** Departamento */
export interface Departamento {
  idDep:  number;
  nomDep: string;
}

/** Usuario */
export interface Usuario {
  idUsr:   number;
  nomUsr:  string;
  apeUsr?: string;
  corUsr:  string;
  telUsr?: string;
  usuLogin: string;
  idRol:   number;
  estUsr:  number;
}

export interface CreateUsuarioPayload {
  nomUsr:  string;
  apeUsr:  string;
  corUsr:  string;
  telUsr?: string;
  usuLogin: string;
  password: string;
  idRol:   number;
  idDep?:  number;
  idUbi?:  number;
}

export interface UpdateUsuarioPayload {
  nomUsr?:  string;
  apeUsr?:  string;
  corUsr?:  string;
  telUsr?:  string;
  usuLogin?: string;
  password?: string;
  idRol?:   number;
  idDep?:   number;
  idUbi?:   number;
  estUsr?:  number;
}

/** Préstamo */
export interface Prestamo {
  idPre:   number;
  fecPre:  string;
  fecDevPre?: string;
  estPre:  number;
  obsePre?: string;
  idUsu:   number;
  detalles?: DetallePrestamo[];
}

export interface DetallePrestamo {
  idPre:  number;
  idArt:  number;
  canPre: number;
  articulo?: Articulo;
}

export interface CreatePrestamoPayload {
  fecPre:     string;
  fecDevPre?: string;
  obsePre?:   string;
  idUsu:      number;
}

export interface CreateDetallePrestamoPayload {
  idArt:  number;
  canPre: number;
}

/** Mantenimiento */
export interface Mantenimiento {
  idMan:     number;
  fecIni:    string;
  fecFin?:   string;
  tipMan:    string;
  desMan?:   string;
  obsMan?:   string;
  obsMen?:   string;
  estMan:    number;
  idArt:     number;
  idUsr?:    number;
  idEst?:    number;
}

export interface CreateMantenimientoPayload {
  desMan:    string;
  tipMan:    string;
  fecIni:    string;
  fecFin?:   string;
  obsMan?:   string;
  obsMen?:   string;
  idArt:     number;
  idUsr:     number;
  idEst:     number;
}
