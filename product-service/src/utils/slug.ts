import slugify from "slugify"
export const generateSlug = (name: string) => {
    const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        locale: "vi"
    })
    return baseSlug
}