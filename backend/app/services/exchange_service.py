from app.database import supabase
from uuid import uuid4


def create_request(data, user_id):
    # Get book owner
    book_res = supabase.table("books").select("id, owner_id").eq("id", data.book_id).execute()
    if not book_res.data:
        raise Exception("Book not found")

    to_user_id = book_res.data[0]["owner_id"]

    payload = {
        "id": str(uuid4()),
        "book_id": data.book_id,
        "from_user_id": user_id,
        "to_user_id": to_user_id,
        "status": "pending"
    }
    response = supabase.table("book_request").insert(payload).execute()
    return response.data[0]

def get_sent_requests(user_id):
    response = supabase.table("book_request").select("*").eq("from_user_id", user_id).execute()
    return response.data


def get_received_requests(user_id):
    response = supabase.table("book_request").select("*").eq("to_user_id", user_id).execute()
    return response.data


def respond_to_request(request_id, status, user_id):
    # Ensure the user is the receiver
    res = supabase.table("book_request").select("to_user_id, book_id").eq("id", request_id).single().execute()
    request_data = res.data

    if not request_data:
        raise Exception("Request not found")

    if request_data["to_user_id"] != user_id:
        raise Exception("Unauthorized")

    # Update the request status
    update = supabase.table("book_request").update({"status": status}).eq("id", request_id).execute()

    # If accepted, mark the book as no longer available (or exchanged)
    if status.lower() == "accepted":
        book_id = request_data["book_id"]
        supabase.table("books").update({"status": "reserved"}).eq("id", book_id).execute()

    return update.data[0]


def delete_request(request_id, user_id):
    # First check if the request exists and belongs to this user
    response = supabase.table("book_request") \
        .select("*") \
        .eq("id", request_id) \
        .eq("status", "pending") \
        .eq("from_user_id", user_id) \
        .execute()

    if not response.data:
        return {"error": "No matching pending request for this user."}

    # Delete the request
    delete_response = supabase.table("book_request") \
        .delete() \
        .eq("id", request_id) \
        .execute()
    
    return delete_response.data[0] if delete_response.data else {"message": "Request deleted successfully"}