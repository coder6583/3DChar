function Vec3(x = 0, y = 0, z = 0)
{
    this.x = x;
    this.y = y;
    this.z = z;
}
Vec3.prototype.floor = function()
{
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
}

function Vec4(x = 0, y = 0, z = 0, w = 0)
{
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}

function Vec2(x = 0, y = 0)
{
    this.x = x;
    this.y = y;
}
Vec2.prototype.floor = function()
{
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
}

function Triangle(p1 = new Vec3(0, 0, 0), p2 = new Vec3(0, 0, 0), p3 = new Vec3(0,0,0))
{
    this.points = [p1, p2, p3];
    this.shade = 0;
}

function Mat4()
{
    this.matrix = 
    [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
    ]
}

Mat4.prototype.setIdentity = function()
{
    this.matrix = 
    [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

function Mesh()
{
    this.triangles = [];
}
function MakeRotateXAxis(fTheta)
{
    let mat2 = new Mat4();
    mat2.matrix = 
    [
        [1, 0, 0, 0],
        [0, Math.cos(fTheta), -Math.sin(fTheta), 0],
        [0, Math.sin(fTheta), Math.cos(fTheta), 0],
        [0, 0, 0, 1]
    ];
    return mat2;
}

function MakeRotateYAxis(fTheta)
{
    let mat2 = new Mat4();
    mat2.matrix = 
    [
        [Math.cos(fTheta), 0, Math.sin(fTheta), 0],
        [0, 1, 0, 0],
        [-Math.sin(fTheta), 0, Math.cos(fTheta), 0],
        [0, 0, 0, 1]
    ];
    return mat2;
}

function MakeRotateZAxis(fTheta)
{
    let mat2 = new Mat4();
    mat2.matrix = 
    [
        [Math.cos(fTheta), -Math.sin(fTheta), 0, 0],
        [Math.sin(fTheta), Math.cos(fTheta), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    return mat2;
}

function MakeRotate(axis, fTheta)
{
    let mat = new Mat4();
    let cosine = Math.cos(fTheta);
    let sine = Math.sin(fTheta);
    mat.matrix = 
    [
        [cosine+ axis.x * axis.x * (1 - cosine), axis.x * axis.y * (1 - cosine) - axis.z * sine, axis.x * axis.z * (1 - cosine) + axis.y * sine, 0],
        [axis.x * axis.y * (1 - cosine) + axis.z * sine, cosine + axis.y * axis.y * (1 - cosine), axis.z * axis.y * (1 - cosine) - axis.x * sine, 0],
        [axis.z * axis.x * (1 - cosine) - axis.y * sine, axis.z * axis.y * (1 - cosine) + axis.x * sine, cosine+ axis.z * axis.z * (1 - cosine), 0],
        [0, 0, 0, 1]
    ];
    return mat;
}

function MakeTranslate(vec)
{
    let mat2 = new Mat4();
    mat2.matrix = 
    [
        [1, 0, 0, vec.x],
        [0, 1, 0, vec.y],
        [0, 0, 1, vec.z],
        [0, 0, 0, 1]
    ];
    return mat2;
}

function MakePointAt(pos, target, up)
{
    let newForward = new Vec3();
    newForward = vec3Sub(pos, target);
    // console.log(newForward);

    let temp = new Vec3();
    temp = vec3Multiply(temp, dot(up, newForward));
    // console.log(temp);

    let newUp = vec3Sub(temp, up);
    newUp = normalize(newUp);

    let newRight = cross(newUp, newForward);

    let mat = new Mat4();
    mat.matrix = 
    [
        [newRight.x, newUp.x, newForward.x, pos.x],
        [newRight.y, newUp.y, newForward.y, pos.y],
        [newRight.z, newUp.z, newForward.z, pos.z],
        [0, 0, 0, 1]
    ];
    // console.log(mat);
    return mat;
}

function MatInverse(mat) //only for rotation and translation
{
    let newMat = new Mat4();
    newMat.matrix = 
    [
        [mat.matrix[0][0], mat.matrix[1][0], mat.matrix[2][0], 0],
        [mat.matrix[0][1], mat.matrix[1][1], mat.matrix[2][1], 0],
        [mat.matrix[0][2], mat.matrix[1][2], mat.matrix[2][2], 0],
        [0, 0, 0, 1],
    ];
    newMat.matrix[0][3] = -(mat.matrix[0][3] * mat.matrix[0][0] + mat.matrix[1][3] * mat.matrix[1][0] + mat.matrix[2][3] * mat.matrix[2][0]);
    newMat.matrix[1][3] = -(mat.matrix[0][3] * mat.matrix[0][1] + mat.matrix[1][3] * mat.matrix[1][1] + mat.matrix[2][3] * mat.matrix[2][1]);
    newMat.matrix[2][3] = -(mat.matrix[0][3] * mat.matrix[0][2] + mat.matrix[1][3] * mat.matrix[1][2] + mat.matrix[2][3] * mat.matrix[2][2]);
    // console.log(newMat);
    return newMat;
}


function MultiplyVecMat(ivec, mat)
{
    let ovec = new Vec3();
    ovec.x = ivec.x * mat.matrix[0][0] + ivec.y * mat.matrix[0][1] + ivec.z * mat.matrix[0][2] + mat.matrix[0][3];
    ovec.y = ivec.x * mat.matrix[1][0] + ivec.y * mat.matrix[1][1] + ivec.z * mat.matrix[1][2] + mat.matrix[1][3];
    ovec.z = ivec.x * mat.matrix[2][0] + ivec.y * mat.matrix[2][1] + ivec.z * mat.matrix[2][2] + mat.matrix[2][3];
    let w = ivec.x * mat.matrix[3][0] + ivec.y * mat.matrix[3][1] + ivec.z * mat.matrix[3][2] + mat.matrix[3][3];
    // ovec.x = ivec.x * mat.matrix[0][0] + ivec.y * mat.matrix[1][0] + ivec.z * mat.matrix[2][0] + mat.matrix[3][0];  
    // ovec.y = ivec.x * mat.matrix[0][1] + ivec.y * mat.matrix[1][1] + ivec.z * mat.matrix[2][1] + mat.matrix[3][1];  
    // ovec.z = ivec.x * mat.matrix[0][2] + ivec.y * mat.matrix[1][2] + ivec.z * mat.matrix[2][2] + mat.matrix[3][2];
    // let w = ivec.x * mat.matrix[0][3] + ivec.y * mat.matrix[1][3] + ivec.z * mat.matrix[2][3] + mat.matrix[3][3];
    if(w != 0)
    {
        ovec.x /= w;
        ovec.y /= w;
        ovec.z /= w;
    } 
    return ovec;
}

function MultiplyProjVecMat(ivec, mat)
{
    let ovec = new Vec3();
    // ovec.x = ivec.x * mat.matrix[0][0] + ivec.y * mat.matrix[0][1] + ivec.z * mat.matrix[0][2] + mat.matrix[0][3];
    // ovec.y = ivec.x * mat.matrix[1][0] + ivec.y * mat.matrix[1][1] + ivec.z * mat.matrix[1][2] + mat.matrix[1][3];
    // ovec.z = ivec.x * mat.matrix[2][0] + ivec.y * mat.matrix[2][1] + ivec.z * mat.matrix[2][2] + mat.matrix[2][3];
    // let w = ivec.x * mat.matrix[3][0] + ivec.y * mat.matrix[3][1] + ivec.z * mat.matrix[3][2] + mat.matrix[3][3];
    ovec.x = ivec.x * mat.matrix[0][0] + ivec.y * mat.matrix[1][0] + ivec.z * mat.matrix[2][0] + mat.matrix[3][0];  
    ovec.y = ivec.x * mat.matrix[0][1] + ivec.y * mat.matrix[1][1] + ivec.z * mat.matrix[2][1] + mat.matrix[3][1];  
    ovec.z = ivec.x * mat.matrix[0][2] + ivec.y * mat.matrix[1][2] + ivec.z * mat.matrix[2][2] + mat.matrix[3][2];
    let w = ivec.x * mat.matrix[0][3] + ivec.y * mat.matrix[1][3] + ivec.z * mat.matrix[2][3] + mat.matrix[3][3];
    if(w != 0)
    {
        ovec.x /= w;
        ovec.y /= w;
        ovec.z /= w;
    } 
    return ovec;
}

function vec3Sub(vec1, vec2)
{
    let newVec3 = new Vec3();
    newVec3.x = vec2.x - vec1.x;
    newVec3.y = vec2.y - vec1.y;
    newVec3.z = vec2.z - vec1.z;
    return newVec3;
}

function vec3Add(vec1, vec2)
{
    let newVec3 = new Vec3();
    newVec3.x = vec1.x + vec2.x;
    newVec3.y = vec1.y + vec2.y;
    newVec3.z = vec1.z + vec2.z;
    return newVec3;
}

function vec3Multiply(vec, num)
{
    let newVec3 = new Vec3();
    newVec3.x = vec.x * num;
    newVec3.y = vec.y * num;
    newVec3.z = vec.z * num;
    return newVec3;
}

function vec3Divide(vec, num)
{
    let newVec3 = new Vec3();
    newVec3.x = vec.x / num;
    newVec3.y = vec.y / num;
    newVec3.z = vec.z / num;
    return newVec3;
}

function cross(vec1, vec2)
{
    let newVec3 = new Vec3();
    newVec3.x = vec1.y * vec2.z - vec2.y * vec1.z;
    newVec3.y = vec1.z * vec2.x - vec2.z * vec1.x;
    newVec3.z = vec1.x * vec2.y - vec2.x * vec1.y;
    return newVec3;
}

function dot(vec1, vec2)
{
    let dotProduct = 0;
    dotProduct = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
    return dotProduct;
}

function dotVec4(vec1, vec2)
{
    let dotProduct = 0;
    dotProduct = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z + vec1.w * vec2.w;
    return dotProduct;
}

function normalize(vec)
{
    let normalizedVec = new Vec3();
    let l = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    normalizedVec.x = vec.x / l;
    normalizedVec.y = vec.y / l;
    normalizedVec.z = vec.z / l;
    return normalizedVec;
}

function getNormal(triangle)
{
    let normal = new Vec3();
    normal = cross(vec3Sub(triangle.points[0], triangle.points[1]), vec3Sub(triangle.points[0], triangle.points[2]));
    let l = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    normal.x /= l;
    normal.y /= l;
    normal.z /= l;

    return normal;
}

function MultiplyMatMat(mat1, mat2)
{
    let newMat = new Mat4();
    for(let r = 0; r < newMat.matrix.length; r++)
    {
        for(let c = 0; c < newMat.matrix[r].length; c++)
        {
            newMat.matrix[r][c] = (mat1.matrix[r][0] * mat2.matrix[0][c] + mat1.matrix[r][1] * mat2.matrix[1][c] + mat1.matrix[r][2] * mat2.matrix[2][c] + mat1.matrix[r][3] * mat2.matrix[3][c]);
        }
    }
    return newMat;
}



function interpolate(p1, p2)
{
    let xcoords = new Map();
    let ydiff = p2.y - p1.y, xdiff = p2.x - p1.x, m = ydiff / xdiff;
    if(xdiff != 0 && (m >= 1 || m <= -1) && ydiff > 0)
    {
        for(let y = p1.y; y <= p2.y; y++)
        {
            x = (y + m * p1.x - p1.y)/m;
            xcoords.set(Math.floor(y), [Math.floor(x)]);
        }
    }
    else if(ydiff != 0 && (m < 1 && m > -1)&& xdiff > 0)
    {
        for(let x = p1.x; x <= p2.x; x++)
        {
            y = m * (x - p1.x) + p1.y;
            xcoords.set(Math.floor(y), [Math.floor(x)]);
        }
    }
    else if(xdiff != 0 && (m >= 1 || m <= -1) && ydiff < 0)
    {
        for(let y = p2.y; y <= p1.y; y++)
        {
            x = (y + m * p1.x - p1.y)/m;;
            xcoords.set(Math.floor(y), [Math.floor(x)]);
        }
    }
    else if(ydiff != 0 && (m < 1 && m > -1)&& xdiff < 0)
    {
        for(let x = p2.x; x <= p1.x; x++)
        {
            y = m * (x - p1.x) + p1.y;
            xcoords.set(Math.floor(y), [Math.floor(x)]);
        }
    }
    else if(ydiff == 0 && xdiff > 0)
    {
        
        for(let x = p1.x; x <= p2.x; x++)
        {
            if(!xcoords.has(p1.y))
            xcoords.set(Math.floor(p1.y), [Math.floor(x)]);
            else if(xcoords.has(p1.y))
                xcoords.get(p1.y).push(Math.floor(x));
        }
    } 
    else if(ydiff == 0 && xdiff < 0)
    {
        for(let x = p2.x; x <= p1.x; x++)
        {
            if(!xcoords.has(p1.y))
                xcoords.set(Math.floor(p1.y), [Math.floor(x)]);
            else if(xcoords.has(p1.y))
                xcoords.get(p1.y).push(Math.floor(x));
        }
    } 
    else if(xdiff == 0 && ydiff > 0)
    {
        for(let y = p1.y; y <= p2.y; y++)
        {
            xcoords.set(Math.floor(y), [Math.floor(p1.x)]);
        }
    } 
    else if(xdiff == 0 && ydiff < 0)
    {
        for(let y = p2.y; y <= p1.y; y++)
        {
            xcoords.set(Math.floor(y), [Math.floor(p1.x)]);
        }
    }
    else if(xdiff == 0 && ydiff == 0)
    {
        xcoords.set(Math.floor(p1.y), [Math.floor(p1.x)]);
    }
    return xcoords;
}

function translateTriangle(triangle, transVec)
{
    let newTri = new Triangle();
    newTri = triangle;
    newTri.points[0].x = triangle.points[0].x + transVec.x;
    newTri.points[0].y = triangle.points[0].y + transVec.y;
    newTri.points[0].z = triangle.points[0].z + transVec.z;
    newTri.points[1].x = triangle.points[1].x + transVec.x;
    newTri.points[1].y = triangle.points[1].y + transVec.y;
    newTri.points[1].z = triangle.points[1].z + transVec.z;
    newTri.points[2].x = triangle.points[2].x + transVec.x;
    newTri.points[2].y = triangle.points[2].y + transVec.y;   
    newTri.points[2].z = triangle.points[2].z + transVec.z;
    return newTri;
}

function scaleTriToScreen(triangle, screenWidth, screenHeight)
{
    let newTri = new Triangle();
    newTri = triangle;
    newTri.points[0].x *= 0.5 * screenWidth;
    newTri.points[0].y *= 0.5 * screenHeight;
    newTri.points[0].z = triangle.points[0].z;
    newTri.points[1].x *= 0.5 * screenWidth;
    newTri.points[1].y *= 0.5 * screenHeight;
    newTri.points[1].z = triangle.points[1].z;
    newTri.points[2].x *= 0.5 * screenWidth;
    newTri.points[2].y *= 0.5 * screenHeight;
    newTri.points[2].z = triangle.points[2].z;
    return newTri;
}

function toRad(degree)
{
    return degree / 180 * Math.PI;
}

function intersectPlane(plane_p, plane_n, lineStart, lineEnd)
{
    plane_n = normalize(plane_n);
    let plane_d = -dot(plane_n, plane_p);
    let startDot = dot(lineStart, plane_n);
    let endDot = dot(lineEnd, plane_n);
    let t = (-plane_d - startDot) / (endDot - startDot);
    let lineStartToEnd = vec3Sub(lineStart, lineEnd);
    let lineToIntersect = vec3Multiply(lineStartToEnd);
    return vec3Add(lineStart, lineToIntersect);
}

function clipAgainstPlane(plane_p, plane_n, in_tri)
{
    let triToReturn = [];
    plane_n = normalize(plane_n);

    const dist = (p) =>
    {
        let n = normalize(p);
        return (plane_n.x * p.x + plane_n.y * p.y + plane_n.z * p.z - dot(plane_n, plane_p));
    };

    let inside_points = [];
    let insidePointCount = 0;
    let outside_points = [];
    let outsidePointCount = 0;

    let d0 = dist(in_tri.points[0]);
    let d1 = dist(in_tri.points[1]);
    let d2 = dist(in_tri.points[2]);

    if(d0 >= 0) {inside_points[insidePointCount++] = in_tri.points[0];}
    else { outside_points[outsidePointCount++] = in_tri.points[0];}
    if(d1 >= 0) {inside_points[insidePointCount++] = in_tri.points[1];}
    else { outside_points[outsidePointCount++] = in_tri.points[1];}
    if(d2 >= 0) {inside_points[insidePointCount++] = in_tri.points[2];}
    else { outside_points[outsidePointCount++] = in_tri.points[2];}

    if(insidePointCount == 0)
    {
        return triToReturn;
    }
    else if(insidePointCount == 3)
    {
        triToReturn.push(in_tri);
        return triToReturn;
    }
    else if(insidePointCount == 1 && outsidePointCount == 2)
    {
        let out_tri = in_tri;
        out_tri.points[1].points[0] = intersectPlane(plane_p, plane_n, inside_points[0], outside_points[0]);
        out_tri.points[2].points[1] = intersectPlane(plane_p, plane_n, inside_points[1], outside_points[1]);
        triToReturn.push(out_tri);
        return triToReturn;
    }
    else if(insidePointCount == 2 && outsidePointCount == 1)
    {
        let out_tri1 = new Triangle();
        let out_tri2 = new Triangle();
        
        out_tri1.shade = in_tri.shade;
        out_tri2.shade = in_tri.shade;

        out_tri1.points[0] = inside_points[0];
        out_tri1.points[1] = inside_points[1];
        out_tri1.points[2] = intersectPlane(plane_p, plane_n, inside_points[0], outside_points[0]);

        out_tri1.points[0] = inside_points[1];
        out_tri1.points[1] = out_tri1.points[2];
        out_tri1.points[2] = intersectPlane(plane_p, plane_n, inside_points[1], outside_points[0]);

        triToReturn.push(out_tri1);
        triToReturn.push(out_tri2);
        return triToReturn;
    }
}