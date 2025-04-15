<template>
  <v-container>
    <v-form>
      <v-row>
        <v-col cols="12">
          <v-sheet class="rounded-xxl">
            <v-text-field
              label="Email"
              bg-color="#DBF2F4"
              variant="solo-filled"
              clearable
              rounded="xxl"
            />
          </v-sheet>
        </v-col>
        <v-col cols="12">
          <v-text-field
            label="Contraseña"
            bg-color="#DBF2F4"
            variant="solo-filled"
            clearable
            rounded="xxl"
          />
          <span class="">
            ¿Olvidaste tu contraseña?
          </span>
        </v-col>
        <v-col>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
