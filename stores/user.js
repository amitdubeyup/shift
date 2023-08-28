import { useToast } from 'vue-toastification';
const toast = useToast();

export const Store = defineStore('store', {
    state: () => ({
        toggle: false,
        range_date: "",
        range_value: 0,
        active_index: 0,
        record: {},
        records: [{
            title: "this is title",
            description: "this is description",
            shifts: [{
                date: "27-08-2023",
                start_time: "10:00",
                end_time: "12:00",
                price: 100,
                type: "Consultation",
            }, {
                date: "27-08-2023",
                start_time: "14:00",
                end_time: "16:00",
                price: 300,
                type: "Ambulance",
            }, {
                date: "27-08-2023",
                start_time: "12:00",
                end_time: "14:00",
                price: 200,
                type: "Telephone",
            }
            ]
        }],
    }),
    getters: {
        data: (state) => state.profile,
    },
    actions: {
        save(data) {
            if (data.shifts) {
                this.range_date = "";
                this.records.push(data);
                toast.success("Shift saved successfully!");
            } else {
                toast.error("Shift is required!");
            }
        },
        update(index) {
            this.record = this.records[index];
            toast.success("Shift updated successfully!");
        },
        delete() {
            this.records.splice(this.active_index, 1);
            toast.success("Shift deleted successfully!");
        },
        filter(price) {
            if (this.range_value > 0) {
                this.records.map((record) => {
                    let shifts = record.shifts.slice();
                    shifts = shifts.sort((a, b) => a.price - b.price);
                    const index = shifts.findIndex((el) => el.price == parseInt(price));
                    const match = shifts[index];
                    if (index > -1) {
                        shifts.splice(index, 1);
                        shifts.unshift(match);
                    }
                    record.shifts = shifts;
                    return record;
                });
            }
        }
    },
})
