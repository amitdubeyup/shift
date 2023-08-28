<script setup lang="ts">
import { reactive, computed, watch } from "vue";
import { ref } from 'vue'; //Import reference for displaying slider count
import { Form, Field, useForm, FieldArray, useFieldArray } from 'vee-validate'; //Import vee-validate for form validation
import * as yup from 'yup'; //Import yup for schema validation
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { Store } from './stores';
const store = Store(); //Import Store

// Update Slider Counter Start
const input_range: any = ref<HTMLInputElement | null>(null);
const display_range: any = ref<HTMLElement | null>(null);
const shift_form: any = ref<HTMLElement | null>(null);
const range_value = computed(() => {
  if (input_range.value && display_range.value) {
    const updated_position = Number((store.range_value - input_range.value?.min) * 100 / (input_range.value?.max - input_range.value?.min));
    const new_position = 10 - (updated_position * 0.2);
    display_range.value.style.left = `calc(${updated_position}% + (${new_position}px))`;
  }
  store.filter(store.range_value);
  return store.range_value;
});
// Update Slider Counter End

// Declare Form Schema
const schema = yup.object().shape({
  title: yup.string().required().min(1).max(100).label("Title"),
  description: yup.string().required().min(1).max(500).label("Description"),
  shifts: yup.array()
    .of(
      yup.object().shape({
        date: yup.string().label("Date"),
        start_time: yup.string().required().label("Start time"),
        end_time: yup.string().required().label("End time"),
        price: yup.number().required().min(0).label("Price"),
        type: yup.string().required().label("Type"),
      })
    ).min(1).label("Shifts")
});

// Initialize Form & Data
const { setValues, setTouched } = useForm({
  initialValues: {
    title: "",
    description: "",
    shifts: []
  },
});
const { fields, push, remove, replace } = useFieldArray('shifts');

// Handle Date Selection
const handleDate = (data: any) => {
  if (data && data.length) {
    let dates: any = [];
    data.map((el: any) => {
      const final = new Date(el);
      if (!isNaN(final.getTime())) {
        const day = final.getDate() < 10 ? `0${final.getDate()}` : final.getDate();
        const month = final.getMonth() + 1 < 10 ? `0${final.getMonth() + 1}` : final.getMonth() + 1;
        const year = final.getFullYear();
        dates.push(`${day}-${month}-${year}`);
      }
    });
    dates = [...new Set(dates)];
    replace([]);
    dates.forEach((el: any) => {
      const data = {
        date: el,
        start_time: "",
        end_time: "",
        price: "",
        type: "",
      };
      push(data);
    });
  } else {
    replace([]);
  }
};

// Remove Dynamic Form
const removeForm = (index: number) => {
  remove(index);
};

// Submit Form
const onSubmit = (values: any, actions: any) => {
  store.save(values);
  actions.resetForm();
};

const addShift = () => {
  store.toggle = !store.toggle;
  replace([]);
};

const editForm = (index: number) => {
  store.toggle = true;
  store.active_index = index;
  const record: any = store.records[index];
  setTouched(record);
  setValues(record);
};

</script>

<template>
  <div class="main row" :class="{ 'full': !store.toggle }">
    <div :class="{ 'col-7': store.toggle, 'col-12': !store.toggle }">
      <div class="row filter">
        <div class="col-12 margin-bottom-15">
          <div class="heading">Filter</div>
        </div>
        <div class="col-12">
          <div class="row">
            <div class="col-3">
              Filter on price
            </div>
            <div class="col-9">
              <div class="range-wrap">
                <div class="range-value" ref="display_range" v-text="range_value"></div>
                <input class="input_range" ref="input_range" type="range" v-model="store.range_value" min="0" max="500" step="1" style="accent-color: #484848;" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="heading">Shifts</div>
        </div>
        <div class="col-6 text-right"><button type="button" class="button" @click="addShift">ADD SHIFT</button></div>
        <div class="col-12">
          <div class="cards">
            <div class="card" v-for="(record, index) of store.records" :key="index">
              <div class="row">
                <div class="col-6">
                  <div class="title">{{ record?.title }}</div>
                  <div class="description">{{ record?.description }}</div>
                </div>
                <div class="col-6 text-right">
                  <div class="icon">
                    <div class="pencil" @click="editForm(index)"></div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="title">Dates</div>
                  <div class="row colored" v-for="(shift, index) of record.shifts" :key="index">
                    <div class="col-3 text-center">{{ shift?.date }}</div>
                    <div class="col-2 text-center">{{ shift?.start_time }}</div>
                    <div class="col-2 text-center">{{ shift?.end_time }}</div>
                    <div class="col-3 text-center">{{ shift?.type }}</div>
                    <div class="col-2 text-center">€{{ shift?.price }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="store.toggle" class="col-5">
      <div class="row forms">
        <div class="col-12">
          <div class="heading">Create/Edit</div>
        </div>
        <div class="col-12">
          <Form ref="shift_form" @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }" autocomplete="off">
            <div class="form-group">
              <label>Title</label>
              <Field name="title" type="text" class="form-control" :class="{ 'is-invalid': errors.title }" />
              <div class="invalid-feedback">{{ errors.title }}</div>
            </div>
            <div class="form-group">
              <br />
              <label>Description</label>
              <Field as="textarea" name="description" class="text-area" :class="{ 'is-invalid': errors.description }" />
              <div class="invalid-feedback">{{ errors.description }}</div>
            </div>
            <div class="form-group">
              <br />
              <label>Dates</label>
              <VueDatePicker v-model="store.range_date" range format="dd/MM/yyyy" @update:model-value="handleDate"></VueDatePicker>
            </div>
            <div class="fields">
              <FieldArray name="shifts">
                <fieldset v-for="(field, index) in fields" :key="field.key">
                  <div class="form-card">
                    <div class="row margin-bottom">
                      <div class="col-6">
                        <div class="date">{{ field.value?.date }}</div>
                        <Field :name="`shifts[${index}].date`" :value="field.value?.date" type="hidden" />
                      </div>
                      <div class="col-6 text-right">
                        <div class="remove" v-show="index > 0" @click="removeForm(index)">X</div>
                      </div>
                    </div>
                    <div class="nested">
                      <div class="row">
                        <div class="col-4">
                          <div class="form-group width-desc">
                            <br />
                            <label class="labels" :for="`start_time_${index}`">Start Time</label>
                            <Field :name="`shifts[${index}].start_time`" type="time" class="form-control nested-control" />
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="form-group width-desc">
                            <br />
                            <label class="labels" :for="`end_time_${index}`">End Time</label>
                            <Field :name="`shifts[${index}].end_time`" type="time" class="form-control nested-control" />
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="form-group width-desc">
                            <br />
                            <label class="labels" :for="`price_${index}`">Price</label>
                            <Field :name="`shifts[${index}].price`" type="number" class="form-control nested-control" />
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="form-group width-type">
                            <br />
                            <label class="labels" :for="`type_${index}`">Type</label>
                            <Field :name="`shifts[${index}].type`" as="select" class="form-control">
                              <option value="" disabled>Select Type</option>
                              <option value="Consultation">Consultation</option>
                              <option value="Telephone">Telephone</option>
                              <option value="Ambulance">Ambulance</option>
                            </Field>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </FieldArray>
            </div>
            <div v-if="Object.keys(errors).length" class="errors"><strong>Error:</strong> {{ Object.keys(errors).map((key) => errors[key]).join(", ") }}</div>
            <div class="form-group text-center">
              <br />
              <button type="button" class="button clear-button" @click="store.delete()">
                Delete
              </button>
              <button type="submit" class="button">
                Save
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>