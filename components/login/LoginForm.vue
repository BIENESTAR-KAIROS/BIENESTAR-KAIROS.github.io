<template>
  <v-container>
    <v-form>
      <v-row>
        <v-col cols="12">
          <v-sheet class="rounded-xxl">
            <v-text-field
              label="Email"
              bg-color="loginInput"
              variant="solo-filled"
              clearable
              rounded="xxl"
            />
          </v-sheet>
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Contraseña"
            bg-color="loginInput"
            variant="solo-filled"
            clearable
            rounded="xxl"
          />
          <div class="w-100 text-right">
            <a class="text-button yantramanav-light " href="/forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </v-col>
        <v-col >
          <div class="d-flex justify-center w-100">
            <v-btn color="greenShadow">
              Iniciar Sesión
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-container>
        <v-row no-gutters>
          <v-col>
            <div class="d-flex h-100 w-100 justify-center align-center text-black">
              <hr class="w-100"/>
            </div>
          </v-col>
          <v-col cols="1">
            <div class="d-flex justify-center align-center">
              <span class="text-button yantramanav-light">
                ó
              </span>
            </div>
          </v-col>
          <v-col >
            <div class="d-flex h-100 w-100 justify-center align-center text-black">
              <hr class="w-100"/>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>
