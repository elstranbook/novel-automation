import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const createNovel = async ({
  userId,
  title,
  model,
  maxSceneLength,
  minSceneLength,
  seriesId,
  bookNumber,
}: {
  userId: string;
  title: string;
  model: string;
  maxSceneLength: number;
  minSceneLength: number;
  seriesId?: string | null;
  bookNumber?: number | null;
}) => {
  const { data, error } = await supabaseAdmin
    .from("novels")
    .insert({
      user_id: userId,
      title,
      model,
      max_scene_length: maxSceneLength,
      min_scene_length: minSceneLength,
      series_id: seriesId ?? null,
      book_number: bookNumber ?? 1,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const updateNovelStoryDetails = async ({
  novelId,
  storyDetails,
}: {
  novelId: string;
  storyDetails: Record<string, unknown>;
}) => {
  const { error } = await supabaseAdmin
    .from("novels")
    .update({ story_details: storyDetails })
    .eq("id", novelId);

  if (error) throw error;
};

export const upsertSingleRow = async ({
  table,
  values,
  novelId,
  userId,
  uniqueKeys = ["novel_id"],
}: {
  table: string;
  values: Record<string, unknown>;
  novelId: string;
  userId: string;
  uniqueKeys?: string[];
}) => {
  const insertValues = {
    ...values,
    novel_id: novelId,
    user_id: userId,
  };

  const { error } = await supabaseAdmin
    .from(table)
    .upsert(insertValues, { onConflict: uniqueKeys.join(",") });

  if (error) throw error;
};

export const replaceSceneRows = async ({
  novelId,
  userId,
  scenes,
}: {
  novelId: string;
  userId: string;
  scenes: Record<string, string[]>;
}) => {
  await supabaseAdmin.from("scenes").delete().eq("novel_id", novelId);

  const rows: {
    novel_id: string;
    user_id: string;
    chapter_title: string;
    scene_content: string;
    scene_order: number;
  }[] = [];

  Object.entries(scenes).forEach(([chapterTitle, chapterScenes]) => {
    chapterScenes.forEach((scene, index) => {
      rows.push({
        novel_id: novelId,
        user_id: userId,
        chapter_title: chapterTitle,
        scene_content: scene,
        scene_order: index,
      });
    });
  });

  if (rows.length) {
    const { error } = await supabaseAdmin.from("scenes").insert(rows);
    if (error) throw error;
  }
};

export const replaceNovelFormats = async ({
  novelId,
  userId,
  formats,
}: {
  novelId: string;
  userId: string;
  formats: Record<string, string>;
}) => {
  await supabaseAdmin.from("novel_formats").delete().eq("novel_id", novelId);

  const rows = Object.entries(formats).map(([formatName, content]) => ({
    novel_id: novelId,
    user_id: userId,
    format_name: formatName,
    content,
  }));

  if (rows.length) {
    const { error } = await supabaseAdmin.from("novel_formats").insert(rows);
    if (error) throw error;
  }
};
