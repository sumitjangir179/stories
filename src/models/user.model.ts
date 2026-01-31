import { boolean, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("user", {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    userName: varchar("userName", { length: 255 }).unique(),
    avatar: varchar("avatar", { length: 255 }).default(""),
    isNewUser: boolean("isNewUser").notNull().default(true),
    refreshToken: text("refreshToken").notNull().default(""),
    createdAt: timestamp("createdAt").notNull().defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdate(() => new Date()),
},
    (table) => ({
        email: uniqueIndex("email").on(table.email),
    })
);


