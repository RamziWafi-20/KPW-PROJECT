import { CATEGORIES_DATA } from './categoriesData.js';
import { ITEMS_PART_1 } from './itemsDataPart1.js';
import { ITEMS_PART_2 } from './itemsDataPart2.js';
import { ITEMS_PART_3 } from './itemsDataPart3.js';
export const ALL_ITEMS = [
    ...ITEMS_PART_1,
    ...ITEMS_PART_2,
    ...ITEMS_PART_3,
];
// Calculate item count per category dynamically
export const ALL_CATEGORIES = CATEGORIES_DATA.map((cat) => {
    const count = ALL_ITEMS.filter((item) => item.categoryId === cat.id).length;
    return {
        ...cat,
        itemCount: count,
    };
});
