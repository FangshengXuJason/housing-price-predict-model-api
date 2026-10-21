import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FEATURE_CONSTRAINTS } from '@/lib/constants';

const predictionFormSchema = z.object({
  square_footage: z.number().min(FEATURE_CONSTRAINTS.square_footage.min + (FEATURE_CONSTRAINTS.square_footage.exclusiveMin ? 0.01 : 0), 'Must be greater than 0').max(FEATURE_CONSTRAINTS.square_footage.max, `Must be at most ${FEATURE_CONSTRAINTS.square_footage.max}`),
  bedrooms: z.number().int().min(FEATURE_CONSTRAINTS.bedrooms.min, `Must be at least ${FEATURE_CONSTRAINTS.bedrooms.min}`).max(FEATURE_CONSTRAINTS.bedrooms.max, `Must be at most ${FEATURE_CONSTRAINTS.bedrooms.max}`),
  bathrooms: z.number().min(FEATURE_CONSTRAINTS.bathrooms.min, `Must be at least ${FEATURE_CONSTRAINTS.bathrooms.min}`).max(FEATURE_CONSTRAINTS.bathrooms.max, `Must be at most ${FEATURE_CONSTRAINTS.bathrooms.max}`),
  year_built: z.number().int().min(FEATURE_CONSTRAINTS.year_built.min, `Must be at least ${FEATURE_CONSTRAINTS.year_built.min}`).max(FEATURE_CONSTRAINTS.year_built.max, `Must be at most ${FEATURE_CONSTRAINTS.year_built.max}`),
  lot_size: z.number().min(FEATURE_CONSTRAINTS.lot_size.min + (FEATURE_CONSTRAINTS.lot_size.exclusiveMin ? 0.01 : 0), 'Must be greater than 0').max(FEATURE_CONSTRAINTS.lot_size.max, `Must be at most ${FEATURE_CONSTRAINTS.lot_size.max}`),
  distance_to_city_center: z.number().min(FEATURE_CONSTRAINTS.distance_to_city_center.min, `Must be at least ${FEATURE_CONSTRAINTS.distance_to_city_center.min}`).max(FEATURE_CONSTRAINTS.distance_to_city_center.max, `Must be at most ${FEATURE_CONSTRAINTS.distance_to_city_center.max}`),
  school_rating: z.number().min(FEATURE_CONSTRAINTS.school_rating.min, `Must be at least ${FEATURE_CONSTRAINTS.school_rating.min}`).max(FEATURE_CONSTRAINTS.school_rating.max, `Must be at most ${FEATURE_CONSTRAINTS.school_rating.max}`),
});

type PredictionFormValues = z.infer<typeof predictionFormSchema>;

export function usePredictionForm() {
  return useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      square_footage: 1500,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2000,
      lot_size: 5000,
      distance_to_city_center: 5,
      school_rating: 7,
    },
  });
}
