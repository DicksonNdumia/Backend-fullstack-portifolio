import type { NextFunction, Response, Request } from 'express'

import {devDataSchema, idSchema, listDevDataSchema} from '../validation/user.ts'
import { db } from '../config/config.db.ts'
import { devData, userTable } from '../schema/shema.ts'
import {desc, eq} from 'drizzle-orm'
import {asyncHandler} from "../utils/helper/asyncHandler.ts";
const MAX_LIMIT = 100

export const devDetails = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = Number(req.params.userId)

        if (isNaN(userId)) {
            res.status(400).json({
                error: 'Invalid user ID',
            })
            return
        }

        const parsed = devDataSchema.safeParse(req.body)

        if (!parsed.success) {
            res.status(400).json({
                error: 'Invalid payload',
                details: parsed.error,
            })
            return
        }

        //console.log('Code arrived')
        const [existingUser] = await db
            .select()
            .from(userTable)
            .where(eq(userTable.id, userId))
            .limit(1)

        if (!existingUser) {
            res.status(404).json({
                error: 'User not found',
            })
            return
        }

        //console.log('Code Passed')

        //console.log('Checking if devData exist')
        const [existingDevProfile] = await db
            .select()
            .from(devData)
            .where(eq(devData.userId, userId))
            .limit(1)

        if (existingDevProfile) {
            res.status(409).json({
                error: 'Developer profile already exists for this user',
            })
            return
        }
        //console.log('passed that exist')

        const { name, email, phone, dateOfBirth, cv } = parsed.data

       // console.log('createdDevProfile')
        const [createdDevProfile] = await db
            .insert(devData)
            .values({
                userId,
                name,
                email,
                phone,
                dateOfBirth: new Date(dateOfBirth),
                cv,
            })
            .returning({
                id: devData.id,
                userId: devData.userId,
                name: devData.name,
                email: devData.email,
                phone: devData.phone,
                cv: devData.cv,
                createdAt: devData.createdAt,
            })

        //console.log('createdDevProfile init')
        res.status(201).json({
            message: 'Developer profile created successfully',
            data: createdDevProfile,
        })
    } catch (error) {
        console.error(error)
        next(error)
    }
})

export const getDevDetails = asyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction,
)=> {
    const parsedId = idSchema.safeParse(req.params.id)

    if (!parsedId.success) {
        return res.status(400).json({
            error: 'Invalid ID',
        })
    }

    const parsedQuery = listDevDataSchema.safeParse(req.query)

    if (!parsedQuery.success) {
        return res.status(400).json({
            error: 'Invalid query parameters',
            details: parsedQuery.error,
        })
    }

    const id = parsedId.data
    const limit = Math.min(parsedQuery.data.limit ?? 50, MAX_LIMIT)


    try {
        const [user] = await db.select().from(devData).where(eq(devData.id,id))

        if(!user) {
            res.status(404).json({
                message: "Dev Data was not found"
            })
            return;
        }

        res.status(200).json({
            message: "Successfully fetched dev details",
            data: user,
        })

    }
    catch (e) {
        console.error(e)
        next(e)
    }
})

