import {
  DEFAULT_PROFORMA_ID_PREFIX,
  parseProformaId,
  suggestNextProformaId,
} from './proforma-id.helper';

describe('proforma-id.helper — casos extremos (V2)', () => {
  describe('parseProformaId', () => {
    it('rechaza IDs sin secuencial numérico', () => {
      expect(parseProformaId('CM-PROF')).toBeNull();
      expect(parseProformaId('')).toBeNull();
    });

    it('parsea prefijos personalizados', () => {
      expect(parseProformaId('OBRA-99')).toEqual({
        prefix: 'OBRA-',
        sequence: 99,
      });
    });
  });

  describe('suggestNextProformaId', () => {
    it('usa CM-PROF-1 cuando no hay registros', () => {
      expect(suggestNextProformaId([])).toBe(`${DEFAULT_PROFORMA_ID_PREFIX}1`);
    });

    it('incrementa el mayor secuencial aunque falten números intermedios', () => {
      expect(suggestNextProformaId(['CM-PROF-3', 'CM-PROF-10'])).toBe(
        'CM-PROF-11',
      );
    });

    it('no reutiliza un ID eliminado lógicamente si aún está en la lista', () => {
      const ids = ['CM-PROF-8', 'CM-PROF-9', 'CM-PROF-10'];
      expect(suggestNextProformaId(ids)).toBe('CM-PROF-11');
    });

    it('permite reutilizar secuencial si el ID fue borrado permanentemente y no está en la lista', () => {
      const idsAfterPermanentDelete = ['CM-PROF-8'];
      expect(suggestNextProformaId(idsAfterPermanentDelete)).toBe('CM-PROF-9');
    });
  });
});
