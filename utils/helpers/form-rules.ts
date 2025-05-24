export const required = (value: string): boolean | string => {
  return value ? true : "Requerido";
};

export const validEmail = (email: string): boolean | string => {
  let regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return regex.test(email) ? true : "Email invalido";
};

export const validateEquality = (equalityCheck: Ref<string>) => {
  return (value: string): boolean | string => {
    return value === equalityCheck.value
      ? true
      : "Las contraseñas no coinciden";
  };
};
