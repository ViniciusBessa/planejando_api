const MIN_VALUE = 0;

const MAX_VALUE = 99999999999999;

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export { MIN_VALUE, MAX_VALUE, currencyFormatter };
