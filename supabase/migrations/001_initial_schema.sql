-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE fitness_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE equipment_enum AS ENUM ('none', 'home_gym', 'gym');
CREATE TYPE skin_type_enum AS ENUM ('normal', 'oily', 'dry', 'combination', 'sensitive');
CREATE TYPE skin_routine_level_enum AS ENUM ('none', 'minimal', 'full');
CREATE TYPE goal_enum AS ENUM ('lose_fat', 'build_muscle', 'body_recomp', 'athletic', 'bulk', 'lean_toned', 'maintain');
CREATE TYPE workout_time_enum AS ENUM ('morning', 'afternoon', 'evening', 'flexible');
CREATE TYPE difficulty_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE day_tag_enum AS ENUM ('push', 'pull', 'legs', 'full_body', 'cardio', 'rest');
CREATE TYPE status_enum AS ENUM ('started', 'completed', 'skipped');
CREATE TYPE meal_type_enum AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
CREATE TYPE routine_type_enum AS ENUM ('am', 'pm');
CREATE TYPE product_category_enum AS ENUM ('cleanser', 'toner', 'moisturizer', 'spf', 'treatment', 'eye_cream', 'other');
CREATE TYPE product_status_enum AS ENUM ('active', 'finished', 'paused');
CREATE TYPE photo_type_enum AS ENUM ('front', 'side', 'back');

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    height_cm FLOAT,
    weight_kg FLOAT,
    age INTEGER,
    gender gender_enum,
    fitness_level fitness_level_enum,
    equipment equipment_enum,
    skin_type skin_type_enum,
    skin_concerns TEXT[],
    skin_routine_level skin_routine_level_enum,
    goal goal_enum,
    timeline_months INTEGER,
    target_weight_kg FLOAT,
    preferred_workout_time workout_time_enum,
    workout_duration_min INTEGER,
    dietary_restrictions TEXT[],
    current_body_photo_path TEXT,
    inspiration_photo_path TEXT,
    daily_calories_target INTEGER,
    daily_protein_g INTEGER,
    daily_carbs_g INTEGER,
    daily_fat_g INTEGER,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Exercises Table
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment equipment_enum,
    difficulty difficulty_enum,
    instructions TEXT,
    image_url TEXT,
    gif_url TEXT
);

-- Workouts Table
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    difficulty difficulty_enum,
    equipment_required equipment_enum,
    estimated_duration_min INTEGER,
    day_tag day_tag_enum
);

-- Workout Exercises Join Table
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER,
    reps INTEGER,
    duration_seconds INTEGER,
    order_index INTEGER,
    notes TEXT
);

-- User Workout Logs
CREATE TABLE user_workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status status_enum DEFAULT 'started',
    notes TEXT
);

-- User Exercise Logs
CREATE TABLE user_exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_log_id UUID NOT NULL REFERENCES user_workout_logs(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets_completed INTEGER,
    reps_actual INTEGER[],
    weight_kg FLOAT[],
    duration_seconds INTEGER
);

-- Foods Table
CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    calories_per_100g FLOAT,
    protein_per_100g FLOAT,
    carbs_per_100g FLOAT,
    fat_per_100g FLOAT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User Meal Photo Logs
CREATE TABLE user_meal_photo_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type meal_type_enum,
    photo_storage_path TEXT NOT NULL,
    ai_model_used TEXT,
    ai_raw_response JSONB,
    ai_detected_items JSONB,
    ai_total_calories_estimate INTEGER,
    user_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Food Logs
CREATE TABLE user_food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    meal_type meal_type_enum,
    date DATE NOT NULL,
    quantity_g FLOAT,
    photo_log_id UUID REFERENCES user_meal_photo_logs(id) ON DELETE SET NULL,
    food_name_override TEXT,
    calories_override FLOAT,
    protein_override FLOAT,
    carbs_override FLOAT,
    fat_override FLOAT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Water Logs
CREATE TABLE user_water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    glasses INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Skin Routines Table
CREATE TABLE skin_routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skin_type skin_type_enum,
    routine_type routine_type_enum,
    steps JSONB
);

-- User Skin Logs
CREATE TABLE user_skin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    routine_type routine_type_enum,
    steps_completed TEXT[],
    completed_all BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, date, routine_type)
);

-- User Skin Products
CREATE TABLE user_skin_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    category product_category_enum,
    notes TEXT,
    status product_status_enum DEFAULT 'active',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Measurements
CREATE TABLE user_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg FLOAT,
    chest_cm FLOAT,
    waist_cm FLOAT,
    hips_cm FLOAT,
    bicep_cm FLOAT,
    thigh_cm FLOAT,
    notes TEXT
);

-- User Progress Photos
CREATE TABLE user_progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    photo_type photo_type_enum,
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meal_photo_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE skin_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access their own profile"
    ON user_profiles FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Exercises are readable by all authenticated users"
    ON exercises FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Workouts are readable by all authenticated users"
    ON workouts FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Workout exercises are readable by all authenticated users"
    ON workout_exercises FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can only access their own workout logs"
    ON user_workout_logs FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own exercise logs"
    ON user_exercise_logs FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Foods are readable by all authenticated users"
    ON foods FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create custom foods"
    ON foods FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can only access their own meal photo logs"
    ON user_meal_photo_logs FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own food logs"
    ON user_food_logs FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own water logs"
    ON user_water_logs FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Skin routines are readable by all authenticated users"
    ON skin_routines FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can only access their own skin logs"
    ON user_skin_logs FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own skin products"
    ON user_skin_products FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own measurements"
    ON user_measurements FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own progress photos"
    ON user_progress_photos FOR ALL
    USING (user_id = auth.uid());

-- Seed Data: Exercises
INSERT INTO exercises (name, muscle_group, equipment, difficulty, instructions) VALUES
('Push-ups', 'Chest', 'none', 'beginner', 'Start in plank position, lower body until chest nearly touches floor, push back up'),
('Diamond Push-ups', 'Chest', 'none', 'intermediate', 'Push-ups with hands forming diamond shape, targets triceps more'),
('Dumbbell Bench Press', 'Chest', 'home_gym', 'intermediate', 'Lie on bench, press dumbbells up from chest'),
('Incline Push-ups', 'Chest', 'none', 'beginner', 'Push-ups with hands elevated, easier variation'),
('Pull-ups', 'Back', 'home_gym', 'intermediate', 'Hang from bar, pull body up until chin over bar'),
('Inverted Rows', 'Back', 'home_gym', 'beginner', 'Lie under table, pull chest to edge'),
('Dumbbell Rows', 'Back', 'home_gym', 'beginner', 'Bend over, pull dumbbell to hip'),
('Superman', 'Back', 'none', 'beginner', 'Lie face down, lift arms and legs simultaneously'),
('Squats', 'Legs', 'none', 'beginner', 'Feet shoulder-width, lower hips back and down, stand up'),
('Lunges', 'Legs', 'none', 'beginner', 'Step forward, lower back knee toward ground, stand up'),
('Bulgarian Split Squats', 'Legs', 'home_gym', 'intermediate', 'Rear foot elevated on bench, squat down'),
('Glute Bridges', 'Legs', 'none', 'beginner', 'Lie on back, lift hips up, squeeze glutes'),
('Plank', 'Core', 'none', 'beginner', 'Hold push-up position, keep body straight'),
('Crunches', 'Core', 'none', 'beginner', 'Lie on back, lift shoulders off ground'),
('Leg Raises', 'Core', 'none', 'beginner', 'Lie on back, lift legs up and down'),
('Russian Twists', 'Core', 'none', 'intermediate', 'Sit with feet up, twist torso side to side'),
('Overhead Press', 'Shoulders', 'home_gym', 'intermediate', 'Press dumbbells overhead from shoulders'),
('Lateral Raises', 'Shoulders', 'home_gym', 'beginner', 'Raise dumbbells to sides up to shoulder height'),
('Pike Push-ups', 'Shoulders', 'none', 'intermediate', 'Push-ups in pike position, targets shoulders'),
('Tricep Dips', 'Arms', 'none', 'beginner', 'Sit on edge, lower body by bending elbows, push up'),
('Bicep Curls', 'Arms', 'home_gym', 'beginner', 'Curl dumbbells up by flexing biceps'),
('Jumping Jacks', 'Cardio', 'none', 'beginner', 'Jump with legs apart and arms overhead');

-- Seed Data: Workouts
INSERT INTO workouts (name, muscle_group, difficulty, equipment_required, estimated_duration_min, day_tag) VALUES
('Beginner Push Day', 'Chest, Shoulders, Triceps', 'beginner', 'none', 30, 'push'),
('Beginner Pull Day', 'Back, Biceps', 'beginner', 'none', 30, 'pull'),
('Beginner Leg Day', 'Legs, Core', 'beginner', 'none', 30, 'legs'),
('Intermediate Push Day', 'Chest, Shoulders, Triceps', 'intermediate', 'home_gym', 45, 'push'),
('Intermediate Pull Day', 'Back, Biceps', 'intermediate', 'home_gym', 45, 'pull'),
('Intermediate Leg Day', 'Legs, Core', 'intermediate', 'home_gym', 45, 'legs'),
('Full Body Beginner', 'Full Body', 'beginner', 'none', 30, 'full_body'),
('Cardio & Core', 'Cardio, Core', 'beginner', 'none', 20, 'cardio'),
('Rest Day', 'Recovery', 'beginner', 'none', 0, 'rest'),
('Home Gym Push', 'Chest, Shoulders, Triceps', 'intermediate', 'home_gym', 45, 'push');

-- Seed Data: Workout Exercises
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, order_index) 
SELECT w.id, e.id, 3, 10, 1 FROM workouts w, exercises e 
WHERE w.name = 'Beginner Push Day' AND e.name = 'Push-ups'
UNION ALL
SELECT w.id, e.id, 3, 12, 2 FROM workouts w, exercises e 
WHERE w.name = 'Beginner Push Day' AND e.name = 'Tricep Dips'
UNION ALL
SELECT w.id, e.id, 3, 10, 3 FROM workouts w, exercises e 
WHERE w.name = 'Beginner Push Day' AND e.name = 'Pike Push-ups';

-- Seed Data: Foods (Indian)
INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g) VALUES
('Dal (Lentils)', 116, 9, 20, 0.4),
('Steamed Rice', 130, 2.7, 28, 0.3),
('Roti/Phulka', 264, 8.5, 52, 1.5),
('Mixed Vegetable Sabzi', 85, 2.5, 12, 3),
('Chicken Curry', 165, 26, 4, 5),
('Paneer', 265, 18, 2, 21),
('Rajma (Kidney Beans)', 127, 9, 23, 0.5),
('Chole (Chickpeas)', 164, 9, 27, 2.6),
('Palak Paneer', 150, 8, 8, 10),
('Aloo Gobi', 95, 3, 14, 3.5),
('Idli', 58, 2, 12, 0.4),
('Dosa', 168, 4, 30, 4),
('Sambar', 65, 3, 12, 1),
('Coconut Chutney', 180, 3, 7, 17),
('Upma', 150, 4, 28, 3),
('Poha', 130, 3, 25, 2),
('Paratha', 290, 6, 40, 12),
('Lassi (Sweet)', 95, 3, 15, 2.5),
('Milk', 42, 3.4, 5, 1),
('Curd/Yogurt', 59, 3.5, 4.7, 3),
('Egg (Boiled)', 155, 13, 1, 11),
('Fish Curry', 145, 22, 3, 5),
('Mutton Curry', 250, 26, 2, 15),
('Biryani', 180, 6, 28, 5),
('Khichdi', 120, 4, 22, 2),
('Sprouts Salad', 95, 8, 12, 0.5),
('Fruit Chaat', 65, 1, 15, 0.3),
('Chana Chaat', 140, 7, 22, 3),
('Oats Porridge', 68, 2.4, 12, 1.4),
('Banana', 89, 1.1, 23, 0.3);

-- Seed Data: Skin Routines
INSERT INTO skin_routines (skin_type, routine_type, steps) VALUES
('normal', 'am', '[
    {"order": 1, "step_name": "Cleanser", "description": "Gentle cleanse to remove overnight buildup"},
    {"order": 2, "step_name": "Moisturizer", "description": "Lightweight moisturizer for hydration"},
    {"order": 3, "step_name": "SPF", "description": "Sunscreen SPF 30+ to protect from UV"}
]'::jsonb),
('normal', 'pm', '[
    {"order": 1, "step_name": "Cleanser", "description": "Double cleanse to remove makeup/sunscreen"},
    {"order": 2, "step_name": "Treatment", "description": "Serum or active ingredients"},
    {"order": 3, "step_name": "Moisturizer", "description": "Richer moisturizer for overnight repair"}
]'::jsonb),
('oily', 'am', '[
    {"order": 1, "step_name": "Cleanser", "description": "Foaming cleanser to control oil"},
    {"order": 2, "step_name": "Toner", "description": "Astringent toner to minimize pores"},
    {"order": 3, "step_name": "Moisturizer", "description": "Oil-free, gel-based moisturizer"},
    {"order": 4, "step_name": "SPF", "description": "Mattifying sunscreen SPF 30+"}
]'::jsonb),
('oily', 'pm', '[
    {"order": 1, "step_name": "Cleanser", "description": "Deep cleansing to remove excess oil"},
    {"order": 2, "step_name": "Treatment", "description": "Salicylic acid or niacinamide serum"},
    {"order": 3, "step_name": "Moisturizer", "description": "Lightweight, non-comedogenic moisturizer"}
]'::jsonb),
('dry', 'am', '[
    {"order": 1, "step_name": "Cleanser", "description": "Creamy, hydrating cleanser"},
    {"order": 2, "step_name": "Moisturizer", "description": "Rich, emollient moisturizer"},
    {"order": 3, "step_name": "SPF", "description": "Hydrating sunscreen SPF 30+"}
]'::jsonb),
('dry', 'pm', '[
    {"order": 1, "step_name": "Cleanser", "description": "Gentle, non-stripping cleanser"},
    {"order": 2, "step_name": "Treatment", "description": "Hyaluronic acid or ceramide serum"},
    {"order": 3, "step_name": "Moisturizer", "description": "Thick night cream or sleeping mask"}
]'::jsonb),
('combination', 'am', '[
    {"order": 1, "step_name": "Cleanser", "description": "Balancing cleanser"},
    {"order": 2, "step_name": "Toner", "description": "Gentle exfoliating toner"},
    {"order": 3, "step_name": "Moisturizer", "description": "Lightweight moisturizer, focus on dry areas"},
    {"order": 4, "step_name": "SPF", "description": "Broad spectrum SPF 30+"}
]'::jsonb),
('combination', 'pm', '[
    {"order": 1, "step_name": "Cleanser", "description": "Gentle cleanse"},
    {"order": 2, "step_name": "Treatment", "description": "Targeted treatment for T-zone"},
    {"order": 3, "step_name": "Moisturizer", "description": "Balancing moisturizer"}
]'::jsonb),
('sensitive', 'am', '[
    {"order": 1, "step_name": "Cleanser", "description": "Fragrance-free, gentle cleanser"},
    {"order": 2, "step_name": "Moisturizer", "description": "Soothing, barrier-repair moisturizer"},
    {"order": 3, "step_name": "SPF", "description": "Mineral sunscreen SPF 30+"}
]'::jsonb),
('sensitive', 'pm', '[
    {"order": 1, "step_name": "Cleanser", "description": "Ultra-gentle cleanser"},
    {"order": 2, "step_name": "Moisturizer", "description": "Calming, fragrance-free night cream"}
]'::jsonb);
